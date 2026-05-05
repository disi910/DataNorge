import json
from functools import lru_cache
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from apps.api.config import settings
from apps.api.db import SessionLocal, ping


_MACRO_FACTS_CANDIDATES = [
    Path("/app/db/seed/macro_facts.json"),
    Path(__file__).resolve().parents[2] / "db" / "seed" / "macro_facts.json",
    Path.cwd() / "db" / "seed" / "macro_facts.json",
]


@lru_cache(maxsize=1)
def _load_macro_facts() -> dict:
    for candidate in _MACRO_FACTS_CANDIDATES:
        if candidate.exists():
            return json.loads(candidate.read_text())
    raise FileNotFoundError("macro_facts.json not found in any known location")

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


@app.get("/macro")
def get_macro_facts() -> dict:
    """Return macro-level facts (consumption trajectory, reserved capacity, equivalents)."""
    return _load_macro_facts()


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


@app.get("/data-centers/{dc_id}")
def get_data_center(dc_id: str) -> dict:
    """Return one data center with full detail: ownership, sources, kommune ratio."""
    dc_sql = text(
        """
        SELECT
            dc.id::text AS id,
            dc.name,
            dc.status,
            dc.address,
            dc.notes,
            dc.first_seen,
            dc.last_verified,
            dc.kommune_code,
            k.name AS kommune_name,
            k.total_electricity_gwh_year AS kommune_gwh,
            ST_X(dc.location) AS lng,
            ST_Y(dc.location) AS lat,
            op.id::text AS operator_id,
            op.name AS operator_name,
            op.brreg_org_nr AS operator_brreg,
            op.country AS operator_country,
            op.registered_address AS operator_address,
            own.id::text AS owner_id,
            own.name AS owner_name,
            own.country AS owner_country,
            own.brreg_org_nr AS owner_brreg
        FROM data_centers dc
        LEFT JOIN kommuner k ON k.code = dc.kommune_code
        LEFT JOIN organizations op ON op.id = dc.operator_org_id
        LEFT JOIN organizations own ON own.id = dc.owner_ultimate_org_id
        WHERE dc.id = :id
        """
    )
    obs_sql = text(
        """
        SELECT
            co.mw_current, co.mw_planned_max, co.confidence,
            co.observed_at, co.extracted_by,
            s.url AS source_url, s.title AS source_title,
            s.domain AS source_domain, s.source_type
        FROM capacity_observations co
        JOIN sources s ON s.id = co.source_id
        WHERE co.data_center_id = :id
        ORDER BY co.observed_at DESC
        """
    )
    with SessionLocal() as s:
        row = s.execute(dc_sql, {"id": dc_id}).mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="data center not found")
        obs = s.execute(obs_sql, {"id": dc_id}).mappings().all()

    capacity = [
        {
            "mw_current": float(o["mw_current"]) if o["mw_current"] is not None else None,
            "mw_planned_max": float(o["mw_planned_max"]) if o["mw_planned_max"] is not None else None,
            "confidence": float(o["confidence"]),
            "observed_at": o["observed_at"].isoformat() if o["observed_at"] else None,
            "extracted_by": o["extracted_by"],
            "source": {
                "url": o["source_url"],
                "title": o["source_title"],
                "domain": o["source_domain"],
                "source_type": o["source_type"],
            },
        }
        for o in obs
    ]

    latest = capacity[0] if capacity else None
    mw = (latest or {}).get("mw_current") or (latest or {}).get("mw_planned_max")
    kommune_gwh = float(row["kommune_gwh"]) if row["kommune_gwh"] is not None else None

    macro = _load_macro_facts()
    util = macro.get("utilization_band", {})
    util_low = float(util.get("low_pct", 40)) / 100.0
    util_high = float(util.get("high_pct", 70)) / 100.0

    kommune_share = None
    if mw is not None and kommune_gwh and kommune_gwh > 0:
        upper_bound = (mw * 8760.0) / (kommune_gwh * 1000.0) * 100.0
        kommune_share = {
            "upper_bound_pct": upper_bound,
            "realistic_low_pct": upper_bound * util_low,
            "realistic_high_pct": upper_bound * util_high,
            "utilization_low_pct": util.get("low_pct", 40),
            "utilization_high_pct": util.get("high_pct", 70),
        }

    return {
        "id": row["id"],
        "name": row["name"],
        "status": row["status"],
        "address": row["address"],
        "notes": row["notes"],
        "first_seen": row["first_seen"].isoformat() if row["first_seen"] else None,
        "last_verified": row["last_verified"].isoformat() if row["last_verified"] else None,
        "location": {"lng": row["lng"], "lat": row["lat"]},
        "kommune": {
            "code": row["kommune_code"],
            "name": row["kommune_name"],
            "total_electricity_gwh_year": kommune_gwh,
        },
        "operator": {
            "id": row["operator_id"],
            "name": row["operator_name"],
            "brreg_org_nr": row["operator_brreg"],
            "country": row["operator_country"],
            "address": row["operator_address"],
        } if row["operator_id"] else None,
        "owner": {
            "id": row["owner_id"],
            "name": row["owner_name"],
            "country": row["owner_country"],
            "brreg_org_nr": row["owner_brreg"],
        } if row["owner_id"] else None,
        "latest_capacity": latest,
        "capacity_history": capacity,
        "kommune_share": kommune_share,
        "kommune_share_pct_upper_bound": kommune_share["upper_bound_pct"] if kommune_share else None,
    }
