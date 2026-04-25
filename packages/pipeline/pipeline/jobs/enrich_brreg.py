"""Enrich organizations with data from Brønnøysundregistrene (BRREG) open API.

For each org with brreg_org_nr and no registered_address (or forced), fetches
the enhet endpoint and stores the raw JSON + extracted fields. Free, no auth,
NLOD-licensed.

API: https://data.brreg.no/enhetsregisteret/api/enheter/{org_nr}
"""
from __future__ import annotations

import json
import time

from loguru import logger
from sqlalchemy import text

from pipeline.db import engine
from pipeline.http import client

BASE = "https://data.brreg.no/enhetsregisteret/api/enheter"
RATE_LIMIT_SEC = 0.5  # ~2 req/s, well under BRREG limits


def _fetch_enhet(c, org_nr: str) -> dict | None:
    r = c.get(f"{BASE}/{org_nr}")
    if r.status_code == 404:
        logger.warning("BRREG 404 for {}", org_nr)
        return None
    r.raise_for_status()
    return r.json()


def run(force: bool = False) -> None:
    with engine.begin() as conn:
        rows = conn.execute(
            text(
                """
                SELECT id::text AS id, brreg_org_nr AS nr, name
                FROM organizations
                WHERE brreg_org_nr IS NOT NULL
                  AND (:force OR registered_address IS NULL OR raw_brreg_json IS NULL)
                ORDER BY name
                """
            ),
            {"force": force},
        ).mappings().all()

    logger.info("Enriching {} organizations from BRREG", len(rows))

    enriched = 0
    missing = 0
    with client(timeout=15) as c:
        for row in rows:
            data = _fetch_enhet(c, row["nr"])
            if data is None:
                missing += 1
                time.sleep(RATE_LIMIT_SEC)
                continue

            address_parts = []
            addr = data.get("forretningsadresse") or {}
            if addr.get("adresse"):
                address_parts.extend(addr["adresse"])
            if addr.get("postnummer"):
                address_parts.append(f"{addr['postnummer']} {addr.get('poststed', '')}")
            address = ", ".join(filter(None, address_parts)) or None

            nace = (data.get("naeringskode1") or {}).get("kode")
            authoritative_name = data.get("navn")

            with engine.begin() as conn:
                conn.execute(
                    text(
                        """
                        UPDATE organizations SET
                            name = COALESCE(:name, name),
                            registered_address = :addr,
                            nace_code = :nace,
                            raw_brreg_json = CAST(:raw AS JSONB),
                            last_verified = NOW()
                        WHERE id = :id
                        """
                    ),
                    {
                        "id": row["id"],
                        "name": authoritative_name,
                        "addr": address,
                        "nace": nace,
                        "raw": json.dumps(data),
                    },
                )
            enriched += 1
            time.sleep(RATE_LIMIT_SEC)

    logger.success("BRREG done. Enriched {} orgs, {} missing in BRREG", enriched, missing)


if __name__ == "__main__":
    run()
