# Datasenter-Norge

Aggregated map + list of Norway's data centers — where they are, who owns them, how much power they draw, and how that compares to the kommune they sit in.

> **Why**: Norway is becoming a hyperscaler magnet (Microsoft, Google, Meta, TikTok/Green Mountain, Bulk). No single public source aggregates the facts. We do.

## Status

Working register: **58 data centers** ingested from Nkom + BRREG-enriched ownership, served by a FastAPI GeoJSON backend, rendered as the **Register Datasenter Norge** UI — a non-scrolling two-column page with a searchable, filterable list on the left and a MapLibre map on the right (markers coloured by status, sized by MW).

See [docs/LOG.md](docs/LOG.md) for progress.

## Docs

- [docs/PROJECT.md](docs/PROJECT.md) — vision, scope, milestones
- [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) — every data source we use
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design
- [docs/SCHEMA.md](docs/SCHEMA.md) — database schema
- [docs/METHODOLOGY.md](docs/METHODOLOGY.md) — how we compute things (public-facing)
- [docs/LOG.md](docs/LOG.md) — dev log

## Stack

React 18 + TypeScript + Vite · MapLibre GL · Tailwind · FastAPI (Python 3.12) · PostgreSQL 16 + PostGIS · Anthropic Claude API · Docker Compose.

Local development only for now; production deploy deferred.

## Local dev

```bash
cp .env.example .env
cd infra
docker compose up
# web → http://localhost:5180
# api → http://localhost:8001/health
# db  → localhost:5433 (Postgres + PostGIS)
```

Ports are offset from the usual 5173/8000/5432 so this can coexist with other local projects. The web app reads `VITE_API_BASE_URL` (defaults to `http://localhost:8001`) to find the API.

## License

Code: [MIT](LICENSE) · Dataset: CC BY 4.0 (per [docs/METHODOLOGY.md](docs/METHODOLOGY.md)).
