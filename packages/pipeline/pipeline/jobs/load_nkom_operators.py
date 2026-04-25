"""Load the authoritative Nkom commercial data center operator list.

Replaces the brittle HTML scraper. Source is the official PDF published by Nkom
(Nasjonal kommunikasjonsmyndighet) under the new datasenterforskrift, dated
2026-03-20: 55 commercial operators registered, 104 total data centers in
operation (incl. captive/internal sites).

PDF: https://nkom.no/datasenter/oversikt
Local: db/seed/nkom_operators_2026-03-20.json
"""
from __future__ import annotations

import json
from pathlib import Path

from loguru import logger
from sqlalchemy import text

from pipeline.db import engine

SEED_PATH = Path(__file__).resolve().parents[3].parent / "db" / "seed" / "nkom_operators_2026-03-20.json"


def _find_seed() -> Path:
    for p in [
        Path("/app/db/seed/nkom_operators_2026-03-20.json"),
        SEED_PATH,
        Path.cwd() / "db" / "seed" / "nkom_operators_2026-03-20.json",
    ]:
        if p.exists():
            return p
    raise FileNotFoundError("nkom_operators_2026-03-20.json not found")


def run() -> None:
    payload = json.loads(_find_seed().read_text())
    operators = payload["operators"]
    src = payload["source"]
    logger.info(
        "Loading Nkom list dated {} ({} commercial operators, {} total DCs)",
        src["published_at"], src["totals"]["commercial_operators"],
        src["totals"]["data_centers_in_operation"],
    )

    inserted = updated = 0
    with engine.begin() as conn:
        existing_src = conn.execute(
            text("SELECT id FROM sources WHERE url = :u"), {"u": src["url"]}
        ).scalar_one_or_none()
        if not existing_src:
            conn.execute(
                text(
                    """
                    INSERT INTO sources (url, title, published_at, source_type, domain)
                    VALUES (:u, :t, :p, 'official-list', 'nkom.no')
                    """
                ),
                {"u": src["url"], "t": src["title"], "p": src["published_at"]},
            )

        for op in operators:
            existing = conn.execute(
                text("SELECT id::text FROM organizations WHERE brreg_org_nr = :n"),
                {"n": op["brreg_org_nr"]},
            ).scalar_one_or_none()
            if existing:
                conn.execute(
                    text(
                        """
                        UPDATE organizations
                        SET name = COALESCE(NULLIF(name, ''), :name), last_verified = NOW()
                        WHERE id = :id
                        """
                    ),
                    {"name": op["name"], "id": existing},
                )
                updated += 1
            else:
                conn.execute(
                    text(
                        """
                        INSERT INTO organizations (brreg_org_nr, name, country)
                        VALUES (:n, :name, 'NO')
                        """
                    ),
                    {"n": op["brreg_org_nr"], "name": op["name"]},
                )
                inserted += 1

    crypto = sum(1 for o in operators if o.get("crypto_pct", 0) > 0)
    logger.success(
        "Nkom done. {} new, {} already present. Crypto-mining operators: {}",
        inserted, updated, crypto,
    )


if __name__ == "__main__":
    run()
