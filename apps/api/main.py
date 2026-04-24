from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from apps.api.config import settings
from apps.api.db import SessionLocal, ping

app = FastAPI(
    title="Datasenter-Norge API",
    description="Read-only API serving the Datasenter-Norge map + list.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    db_ok = False
    try:
        db_ok = ping()
    except Exception:
        db_ok = False
    return {"status": "ok", "db": db_ok}


@app.get("/kommuner")
def list_kommuner() -> dict:
    """Return all Norwegian kommuner as a GeoJSON FeatureCollection."""
    sql = text(
        """
        SELECT code, name,
               total_electricity_gwh_year,
               ST_AsGeoJSON(geometry)::json AS geom
        FROM kommuner
        ORDER BY name
        """
    )
    with SessionLocal() as s:
        rows = s.execute(sql).mappings().all()

    features = [
        {
            "type": "Feature",
            "id": r["code"],
            "geometry": r["geom"],
            "properties": {
                "code": r["code"],
                "name": r["name"],
                "total_electricity_gwh_year": float(r["total_electricity_gwh_year"])
                if r["total_electricity_gwh_year"] is not None
                else None,
            },
        }
        for r in rows
    ]
    return {"type": "FeatureCollection", "features": features}


@app.get("/data-centers")
def list_data_centers() -> dict:
    """Return all data centers as a GeoJSON FeatureCollection (Points)."""
    sql = text(
        """
        SELECT
            dc.id::text AS id,
            dc.name,
            dc.status,
            dc.kommune_code,
            k.name AS kommune_name,
            ST_AsGeoJSON(dc.location)::json AS geom,
            op.name AS operator_name,
            own.name AS owner_name,
            own.country AS owner_country,
            (
                SELECT json_build_object(
                    'mw_current', co.mw_current,
                    'mw_planned_max', co.mw_planned_max,
                    'confidence', co.confidence,
                    'observed_at', co.observed_at
                )
                FROM capacity_observations co
                WHERE co.data_center_id = dc.id
                ORDER BY co.observed_at DESC
                LIMIT 1
            ) AS latest_capacity
        FROM data_centers dc
        LEFT JOIN kommuner k ON k.code = dc.kommune_code
        LEFT JOIN organizations op ON op.id = dc.operator_org_id
        LEFT JOIN organizations own ON own.id = dc.owner_ultimate_org_id
        WHERE dc.location IS NOT NULL
        ORDER BY dc.name
        """
    )
    with SessionLocal() as s:
        rows = s.execute(sql).mappings().all()

    features = []
    for r in rows:
        cap = r["latest_capacity"] or {}
        features.append(
            {
                "type": "Feature",
                "id": r["id"],
                "geometry": r["geom"],
                "properties": {
                    "id": r["id"],
                    "name": r["name"],
                    "status": r["status"],
                    "kommune_code": r["kommune_code"],
                    "kommune_name": r["kommune_name"],
                    "operator": r["operator_name"],
                    "owner": r["owner_name"],
                    "owner_country": r["owner_country"],
                    "mw_current": float(cap["mw_current"])
                    if cap.get("mw_current") is not None
                    else None,
                    "mw_planned_max": float(cap["mw_planned_max"])
                    if cap.get("mw_planned_max") is not None
                    else None,
                    "confidence": float(cap["confidence"])
                    if cap.get("confidence") is not None
                    else None,
                },
            }
        )
    return {"type": "FeatureCollection", "features": features}
