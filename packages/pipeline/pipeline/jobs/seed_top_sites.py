"""Seed hand-curated top Norwegian data centers from db/seed/top_sites.json.

- Upserts organizations (operator + ultimate owner) via brreg_org_nr when present,
  else by (name, country).
- Resolves kommune_code via ST_Contains spatial join against the loaded kommuner.
- Creates a sources row for each site and a capacity_observations row.
- Idempotent on re-run via the (operator_org_id, name) unique constraint.
"""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path

from loguru import logger
from sqlalchemy import text

from pipeline.db import engine

SEED_PATH = Path(__file__).resolve().parents[3].parent / "db" / "seed" / "top_sites.json"
DEFAULT_FILENAME = "top_sites.json"


def _upsert_org(conn, org: dict) -> str:
    """Return org id (uuid as str). Upsert by brreg_org_nr when given, else by (name, country)."""
    org_nr = org.get("brreg_org_nr")
    name = org["name"]
    country = org.get("country") or "NO"

    if org_nr:
        row = conn.execute(
            text("SELECT id::text FROM organizations WHERE brreg_org_nr = :n"),
            {"n": org_nr},
        ).scalar_one_or_none()
        if row:
            return row
        row = conn.execute(
            text(
                """
                INSERT INTO organizations (brreg_org_nr, name, country)
                VALUES (:n, :name, :country)
                RETURNING id::text
                """
            ),
            {"n": org_nr, "name": name, "country": country},
        ).scalar_one()
        return row

    row = conn.execute(
        text(
            """
            SELECT id::text FROM organizations
            WHERE name = :name AND country = :country AND brreg_org_nr IS NULL
            LIMIT 1
            """
        ),
        {"name": name, "country": country},
    ).scalar_one_or_none()
    if row:
        return row
    row = conn.execute(
        text(
            """
            INSERT INTO organizations (name, country) VALUES (:name, :country)
            RETURNING id::text
            """
        ),
        {"name": name, "country": country},
    ).scalar_one()
    return row


def _resolve_kommune(conn, lng: float, lat: float) -> str | None:
    code = conn.execute(
        text(
            """
            SELECT code FROM kommuner
            WHERE ST_Contains(geometry, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))
            LIMIT 1
            """
        ),
        {"lng": lng, "lat": lat},
    ).scalar_one_or_none()
    if code:
        return code
    # Fallback: nearest kommune within 10 km (islands simplified out of M-quality polygons)
    return conn.execute(
        text(
            """
            SELECT code FROM kommuner
            WHERE ST_DWithin(
                geometry::geography,
                ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                10000
            )
            ORDER BY geometry <-> ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
            LIMIT 1
            """
        ),
        {"lng": lng, "lat": lat},
    ).scalar_one_or_none()


def _upsert_source(conn, url: str, title: str, source_type: str) -> str:
    row = conn.execute(
        text("SELECT id::text FROM sources WHERE url = :u LIMIT 1"),
        {"u": url},
    ).scalar_one_or_none()
    if row:
        return row
    row = conn.execute(
        text(
            """
            INSERT INTO sources (url, title, source_type, domain)
            VALUES (:u, :t, :st, :d)
            RETURNING id::text
            """
        ),
        {"u": url, "t": title, "st": source_type, "d": url.split("/")[2] if "://" in url else ""},
    ).scalar_one()
    return row


def run(filename: str = DEFAULT_FILENAME, clean: bool = True) -> None:
    path = _find_seed_file(filename)
    logger.info("Loading seed from {}", path)
    payload = json.loads(path.read_text())
    sites = payload["sites"]
    logger.info("{} sites in seed file (schema v{})", len(sites), payload.get("_schema_version", "?"))

    n_dc = 0
    with engine.begin() as conn:
        if clean:
            # Wipe prior manual-seed observations and any data_centers that no
            # longer have observations attached. Keeps non-seed (extracted)
            # data intact while letting us replace stale seed entries
            # (Digiplex, Basefarm, etc.) with the current April 2026 inventory.
            removed = conn.execute(
                text(
                    "DELETE FROM capacity_observations WHERE extracted_by = 'manual-seed' RETURNING id"
                )
            ).rowcount
            orphaned = conn.execute(
                text(
                    """
                    DELETE FROM data_centers
                    WHERE id NOT IN (SELECT data_center_id FROM capacity_observations)
                    RETURNING id
                    """
                )
            ).rowcount
            logger.info("clean: removed {} manual-seed observations and {} orphaned data_centers", removed, orphaned)
        for site in sites:
            operator_id = _upsert_org(conn, site["operator"])
            owner_id = _upsert_org(conn, site["owner_ultimate"])
            kommune_code = _resolve_kommune(conn, site["lng"], site["lat"])
            if not kommune_code:
                logger.warning(
                    "No kommune match for {} at ({}, {}); site will load without kommune",
                    site["name"], site["lat"], site["lng"],
                )

            existing_id = conn.execute(
                text(
                    "SELECT id::text FROM data_centers WHERE operator_org_id = :op AND name = :n"
                ),
                {"op": operator_id, "n": site["name"]},
            ).scalar_one_or_none()

            if existing_id:
                conn.execute(
                    text(
                        """
                        UPDATE data_centers SET
                          owner_ultimate_org_id = :owner,
                          kommune_code = :k,
                          location = ST_SetSRID(ST_MakePoint(:lng, :lat), 4326),
                          address = :addr,
                          status = :status,
                          last_verified = NOW()
                        WHERE id = :id
                        """
                    ),
                    {
                        "owner": owner_id, "k": kommune_code,
                        "lng": site["lng"], "lat": site["lat"],
                        "addr": site.get("address"), "status": site["status"],
                        "id": existing_id,
                    },
                )
                dc_id = existing_id
            else:
                dc_id = conn.execute(
                    text(
                        """
                        INSERT INTO data_centers
                          (name, operator_org_id, owner_ultimate_org_id, kommune_code,
                           location, address, status)
                        VALUES
                          (:name, :op, :owner, :k,
                           ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), :addr, :status)
                        RETURNING id::text
                        """
                    ),
                    {
                        "name": site["name"], "op": operator_id, "owner": owner_id,
                        "k": kommune_code, "lng": site["lng"], "lat": site["lat"],
                        "addr": site.get("address"), "status": site["status"],
                    },
                ).scalar_one()
                n_dc += 1

            source_id = _upsert_source(
                conn, site["source_url"], site["source_title"], site["source_type"]
            )

            already = conn.execute(
                text(
                    """
                    SELECT 1 FROM capacity_observations
                    WHERE data_center_id = :dc AND source_id = :s AND extracted_by = 'manual-seed'
                    LIMIT 1
                    """
                ),
                {"dc": dc_id, "s": source_id},
            ).scalar_one_or_none()
            if not already:
                conn.execute(
                    text(
                        """
                        INSERT INTO capacity_observations
                          (data_center_id, mw_current, mw_planned_max, observed_at,
                           source_id, confidence, extracted_by)
                        VALUES (:dc, :mw, :mwp, :obs, :s, :c, 'manual-seed')
                        """
                    ),
                    {
                        "dc": dc_id, "mw": site.get("mw_current"),
                        "mwp": site.get("mw_planned_max"),
                        "obs": date.today(), "s": source_id, "c": site["confidence"],
                    },
                )

    logger.success("Seed done. {} new data_centers inserted ({} total sites processed)", n_dc, len(sites))


def _find_seed_file(filename: str = DEFAULT_FILENAME) -> Path:
    for candidate in [
        Path("/app/db/seed") / filename,
        SEED_PATH.parent / filename,
        Path.cwd() / "db" / "seed" / filename,
    ]:
        if candidate.exists():
            return candidate
    raise FileNotFoundError(f"{filename} not found")


if __name__ == "__main__":
    run()
