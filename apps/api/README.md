# apps/api — FastAPI

Read-only REST + GeoJSON API for the Datasenter-Norge frontend.

## Endpoints (current)

- `GET /health` — liveness + db ping
- `GET /macro` — country-level facts (registry counts, consumption trajectory, Statnett reservations, …)
- `GET /kommuner` — GeoJSON FeatureCollection of all 357 Norwegian kommuner with electricity totals
- `GET /data-centers` — GeoJSON FeatureCollection of named sites (58 currently)
- `GET /data-centers/{id}` — full detail for one site (capacity history, kommune share, operator/owner)
- `GET /docs` — auto-generated OpenAPI UI

## Local dev

```bash
# via docker compose (recommended)
cd infra && docker compose up api db

# or standalone (requires local Postgres)
pip install -e ".[dev]"
uvicorn apps.api.main:app --reload --port 8000
```

## Layout

```
apps/api/
├── __init__.py
├── main.py       FastAPI app + routes
├── config.py     pydantic-settings (reads .env)
├── db.py         SQLAlchemy engine + session
└── pyproject.toml
```

Models and routes split into modules as the API grows.
