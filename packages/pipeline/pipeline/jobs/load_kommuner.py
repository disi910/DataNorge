"""Load Norwegian kommune polygons from robhop/fylker-og-kommuner (Kartverket-derived, CC BY 4.0).

Usage:
    pipeline load-kommuner
"""
from __future__ import annotations

import json

from loguru import logger
from sqlalchemy import text

from pipeline.db import engine
from pipeline.http import get_bytes

SOURCE_URL = (
    "https://raw.githubusercontent.com/robhop/fylker-og-kommuner/main/Kommuner-M.geojson"
)


def run() -> None:
    logger.info("Fetching kommune GeoJSON from {}", SOURCE_URL)
    raw = get_bytes(SOURCE_URL)
    data = json.loads(raw)
    features = data["features"]
    logger.info("Parsed {} features", len(features))

    upsert_sql = text(
        """
        INSERT INTO kommuner (code, name, geometry, updated_at)
        VALUES (
            :code,
            :name,
            ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(:geom), 4326)),
            NOW()
        )
        ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            geometry = EXCLUDED.geometry,
            updated_at = NOW()
        """
    )

    inserted = 0
    with engine.begin() as conn:
        for feat in features:
            props = feat["properties"]
            code = props.get("kommunenummer") or props.get("id")
            name = props.get("kommunenavn") or props.get("name")
            geom_json = json.dumps(feat["geometry"])
            conn.execute(upsert_sql, {"code": code, "name": name, "geom": geom_json})
            inserted += 1

    logger.success("Upserted {} kommuner", inserted)


if __name__ == "__main__":
    run()
