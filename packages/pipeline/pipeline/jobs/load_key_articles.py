"""Load curated key articles (press + official lists) into the sources table.

Source: db/seed/key_articles.json — the macro-context references cited on the
methodology page (LO Magasinet feature, Nkom registry, etc.).
"""
from __future__ import annotations

import json
from pathlib import Path

from loguru import logger
from sqlalchemy import text

from pipeline.db import engine

SEED_PATH = Path(__file__).resolve().parents[3].parent / "db" / "seed" / "key_articles.json"


def _find_seed() -> Path:
    for p in [
        Path("/app/db/seed/key_articles.json"),
        SEED_PATH,
        Path.cwd() / "db" / "seed" / "key_articles.json",
    ]:
        if p.exists():
            return p
    raise FileNotFoundError("key_articles.json not found")


def run() -> None:
    payload = json.loads(_find_seed().read_text())
    articles = payload["articles"]
    inserted = skipped = 0
    with engine.begin() as conn:
        for art in articles:
            existing = conn.execute(
                text("SELECT id FROM sources WHERE url = :u"), {"u": art["url"]}
            ).scalar_one_or_none()
            if existing:
                skipped += 1
                continue
            conn.execute(
                text(
                    """
                    INSERT INTO sources (url, title, domain, source_type, published_at)
                    VALUES (:u, :t, :d, :st, :p)
                    """
                ),
                {
                    "u": art["url"], "t": art["title"], "d": art["domain"],
                    "st": art["source_type"], "p": art.get("published_at"),
                },
            )
            inserted += 1
    logger.success("Key articles done. {} new, {} already present.", inserted, skipped)


if __name__ == "__main__":
    run()
