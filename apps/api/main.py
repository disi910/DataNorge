from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.api.config import settings
from apps.api.db import ping

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


@app.get("/data-centers")
def list_data_centers() -> dict:
    # Placeholder until schema + seed data land.
    return {"type": "FeatureCollection", "features": []}
