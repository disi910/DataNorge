# Development log

Append-only. Newest entries at the top. One bullet per meaningful change — not every tool call.

Format: `### YYYY-MM-DD — short title` then bullets. Mark milestones with **M0 / M1 / M2 / M3 / M4**.

---

### 2026-04-24 — M0 scaffolding complete

- Fresh git repo initialized at `/Users/didriksivertsen/DataNorge/`, pushed to https://github.com/disi910/DataNorge (branch `main`).
- Docker Compose stack: postgres+postgis, api, web — with db healthcheck so api waits until Postgres is ready.
- FastAPI skeleton: `/health` (with db ping) + `/data-centers` (empty FeatureCollection placeholder). Pydantic-settings reads `.env`.
- Alembic baseline migration `0001_initial_schema.py` — all six tables per SCHEMA.md: kommuner, organizations, sources, data_centers, capacity_observations, extraction_runs. PostGIS + uuid-ossp extensions enabled.
- Vite + React + TS + Tailwind + MapLibre web app. Split view (40% list, map right). Monochrome palette (ink/paper + teal accent), IBM Plex typography. 6 placeholder rows, OSM raster tiles.
- Commits: `a16e970` foundation · `df674ef` compose · `addf0f0` api · `9edd670` migration · `6446065` web.
- Next (M1): run migration against real db, scrape Nkom list → seed `data_centers`, BRREG enrich `organizations`, load Kartverket kommune polygons + SSB electricity.

---

### 2026-04-24 — M0 kickoff

- Plan approved: map + list first, Python (FastAPI) backend, MapLibre frontend, Postgres+PostGIS. See [plan file](/Users/didriksivertsen/.claude/plans/we-are-going-to-bright-crystal.md).
- Scope narrowed: **local development only for now**. VPS/production deploy deferred.
- Confirmed key data source: **Nkom** maintains an official list of 58 registered data center operators — this becomes our bootstrap seed.
- Other confirmed sources: BRREG open API (ownership), api.nve.no (concessions), Kartverket (boundaries + geocoding), SSB Statistikkbanken (kommune electricity).
- Docs written: `PROJECT.md`, `DATA_SOURCES.md`, `ARCHITECTURE.md`, `SCHEMA.md`, `METHODOLOGY.md`, `LOG.md` (this file).
- Directory scaffold: `apps/{api,web}`, `packages/{pipeline,shared-types}`, `db/{migrations,seed}`, `infra/` with READMEs.
- First commit of project files on branch `claude/amazing-faraday-ea0f62`.
- Next: docker-compose + Alembic baseline + FastAPI/Vite skeletons.
