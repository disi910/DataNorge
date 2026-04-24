# Datasenter-Norge

Aggregated map + list of Norway's data centers — where they are, who owns them, how much power they draw, and how that compares to the kommune they sit in. Plus an AI-driven radar that surfaces new sites as they're announced.

> **Why**: Norway is becoming a hyperscaler magnet (Microsoft, Google, Meta, TikTok/Green Mountain, Bulk). No single public source aggregates the facts. We do.

## Status

**M0 — Foundations.** Docs and structure in place. Code scaffolding next.

See [docs/LOG.md](docs/LOG.md) for progress.

## Docs

- [docs/PROJECT.md](docs/PROJECT.md) — vision, scope, milestones
- [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) — every data source we use
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design
- [docs/SCHEMA.md](docs/SCHEMA.md) — database schema
- [docs/METHODOLOGY.md](docs/METHODOLOGY.md) — how we compute things (public-facing)
- [docs/LOG.md](docs/LOG.md) — dev log

## Stack

React + TypeScript + Vite · MapLibre GL · Tailwind + shadcn/ui · FastAPI (Python 3.12) · PostgreSQL 16 + PostGIS · Anthropic Claude API · Docker Compose.

Local development only for now; production deploy deferred.

## Local dev (once scaffolded)

```bash
docker compose up
# api → http://localhost:8000
# web → http://localhost:5173
```

## License

Code MIT · Dataset CC BY 4.0.
