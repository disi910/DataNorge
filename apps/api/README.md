# apps/api — FastAPI

Read-only REST + GeoJSON API for the Datasenter-Norge frontend.

## Endpoints (current)

- `GET /health` — liveness + db ping
- `GET /data-centers` — GeoJSON FeatureCollection (empty until M1 seed lands)
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
