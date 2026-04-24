# Architecture

## System diagram (ASCII)

```
          ┌──────────────────────────────────────────────────┐
          │                External sources                   │
          │  Nkom · BRREG · NVE · Kartverket · SSB · press    │
          │  rooms · kommune plansak · annual reports (PDF)   │
          └───────────────────┬──────────────────────────────┘
                              │  httpx / Playwright
                              ▼
                    ┌──────────────────┐
                    │  pipeline (py)   │  packages/pipeline
                    │  ─ fetchers      │
                    │  ─ parsers       │
                    │  ─ Claude extr.  │  Anthropic API
                    │  ─ loaders       │
                    └────────┬─────────┘
                             │  SQLAlchemy
                             ▼
                   ┌─────────────────────┐
                   │ Postgres 16 + PostGIS│
                   └─────────┬───────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │  FastAPI    │  apps/api
                      │  read-only  │
                      │  REST+GeoJSON│
                      └──────┬──────┘
                             │  fetch()
                             ▼
                    ┌────────────────────┐
                    │ React + TS + Vite  │  apps/web
                    │ MapLibre · Tailwind│
                    └────────────────────┘
                             │
                             ▼
                     datasenter.didriksi.com
                      (Caddy reverse proxy
                       on existing VPS)
```

## Data flow

1. **Scheduled trigger** (APScheduler) kicks a fetcher for a tier-2 source.
2. **Fetcher** pulls the page/PDF, snapshots it to disk, and records a row in `sources`.
3. **Parser** normalizes obvious fields (title, date). If the source is structured (Nkom, BRREG, SSB), it skips straight to loader.
4. **Claude extractor** runs on unstructured sources, emits the schema in [DATA_SOURCES.md](DATA_SOURCES.md). Stored in `extraction_runs`.
5. **Loader** upserts into `data_centers`, `organizations`, `capacity_observations`.
6. **API** serves `/data-centers` (GeoJSON FeatureCollection), `/data-centers/{id}` (full detail), `/kommuner` (polygons + electricity totals), `/radar` (latest extraction events).
7. **Web** renders map + list. All interactive state on the client.

## Why these choices

- **PostGIS** — kommune heat overlay requires polygon joins with per-kommune aggregation. Trivial in PostGIS, painful anywhere else.
- **FastAPI** — same process handles REST + OpenAPI spec that `/apps/web` consumes to generate TS types. One language pair (Py + TS), zero RPC boilerplate.
- **MapLibre** — Mapbox-compatible API without the token/billing friction. Kartverket publishes WMTS tiles that make the map feel distinctly Norwegian.
- **APScheduler over Celery** — we run a handful of nightly jobs, not a real-time firehose. Don't need Redis or workers yet.
- **Claude Sonnet 4.6 for extraction, Haiku 4.5 for classification** — extraction benefits from Sonnet's reasoning on ambiguous press releases; pre-filtering "is this even about a data center?" is Haiku's job. Prompt caching on the system prompt (the extraction schema + instructions) — the docs change per request, but the schema is cacheable.

## Deploy topology

Local-only for now. Production deploy (VPS, reverse proxy, TLS) is deferred — we'll revisit once the MVP works end-to-end on localhost.

## Local dev

```
docker compose up
# → db on :5432, api on :8000, web dev server on :5173
```

Pipeline runs manually during dev:

```
uv run python -m pipeline.jobs.seed_kommuner
uv run python -m pipeline.jobs.seed_nkom
uv run python -m pipeline.jobs.brreg_enrich
```
