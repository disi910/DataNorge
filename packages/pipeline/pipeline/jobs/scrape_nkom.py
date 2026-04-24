"""Scrape Nkom's public list of registered data center operators.

https://nkom.no/datasenter/oversikt

Extracts (name, org_nr, crypto_mining_flag) into organizations. Does NOT
create data_centers rows (Nkom lists operators, not sites) — that's handled
by the seed + press-release extractors.
"""
from __future__ import annotations

import re

from bs4 import BeautifulSoup
from loguru import logger
from sqlalchemy import text

from pipeline.db import engine
from pipeline.http import client

URL = "https://nkom.no/datasenter/oversikt"
ORG_NR_RE = re.compile(r"^\d{9}$")


def _fetch() -> str:
    with client() as c:
        r = c.get(URL)
        r.raise_for_status()
        return r.text


def _parse(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    operators: list[dict] = []
    seen_orgs: set[str] = set()

    for table in soup.find_all("table"):
        for row in table.find_all("tr"):
            cells = [c.get_text(strip=True) for c in row.find_all(["td", "th"])]
            if len(cells) < 2:
                continue
            # Expect: Navn | Organisasjonsnummer | Kryptovalutautvinning?
            name = cells[0]
            org_nr = cells[1].replace(" ", "")
            if not ORG_NR_RE.match(org_nr):
                continue  # header or malformed row
            if org_nr in seen_orgs:
                continue
            seen_orgs.add(org_nr)
            crypto = cells[2].strip().lower() if len(cells) > 2 else ""
            operators.append(
                {
                    "name": name,
                    "brreg_org_nr": org_nr,
                    "crypto_mining": crypto.startswith(("ja", "yes")),
                }
            )
    return operators


def run() -> None:
    logger.info("Fetching Nkom operator list: {}", URL)
    html = _fetch()
    operators = _parse(html)
    logger.info("Parsed {} operator rows", len(operators))

    inserted = 0
    updated = 0
    with engine.begin() as conn:
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

    logger.success(
        "Nkom done. {} new organizations, {} already known. Crypto miners flagged: {}",
        inserted, updated, sum(1 for o in operators if o["crypto_mining"]),
    )


if __name__ == "__main__":
    run()
