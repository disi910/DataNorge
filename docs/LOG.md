# Development log

Append-only. Newest entries at the top. One bullet per meaningful change — not every tool call.

Format: `### YYYY-MM-DD — short title` then bullets. Mark milestones with **M0 / M1 / M2 / M3 / M4**.

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
