# Development log

Append-only. Newest entries at the top. One bullet per meaningful change — not every tool call.

Format: `### YYYY-MM-DD — short title` then bullets. Mark milestones with **M0 / M1 / M2 / M3 / M4**.

---

### 2026-05-05 — Register UI + polish pass

- Replaced the multi-tab editorial landing with a single `RegisterApp` page that fills the viewport and never scrolls (only the list does). Two-column grid: searchable + filterable + sortable list (58 sites) on the left, MapLibre map on the right, paper-card flyout for the focused site.
- Map markers re-coloured by status: `operational #2f7d5b` / `under_construction #d18b1f` / `planned #4a6fa5` / `decommissioned #9aa0a8`. Inline legend in the map header now shows all three live statuses.
- List capacity bars now encode utilization-of-build-out (`mw_current / mw_planned_max`), not absolute MW. Planned-only sites get a dashed slate outline. MW sort groups by status priority (operational → under_construction → planned → no-capacity), descending within each group.
- Detail card: dropped the redundant region·kommune·status strap, added an X close button, and replaced the country letter code with a flag PNG via `flagsapi.com/{CC}/flat/64.png`.
- Repo housekeeping: added MIT `LICENSE`, refreshed root and per-app READMEs to match shipped reality, set GitHub repo topics.

---

### 2026-04-24 — M1 first real data on the map

- All 357 Norwegian kommune polygons loaded from `robhop/fylker-og-kommuner` (CC BY 4.0, Kartverket-derived). Verified Kautokeino largest at 9707 km².
- Pipeline package scaffolded as a Typer CLI: `pipeline ping`, `pipeline load-kommuner`, `pipeline seed-top-sites`.
- API `/kommuner` and `/data-centers` now serve real GeoJSON from Postgres with spatial queries.
- Web renders kommune polygons as a faint overlay + data center pins colored by status, sized by MW. Popup on click.
- 15 hand-curated top sites seeded with MW estimates and source links (Green Mountain, Bulk, Microsoft, Google Skien, GreenScale Ertsmyra, Lefdal Mine, Digiplex/STACK, Basefarm). All idempotent.
- Known gaps: MW figures are estimates (confidence 0.4–0.7); Nkom-registered operators not yet ingested; BRREG ownership chains not yet traversed; SSB electricity not loaded.
- Commits: `bf14fb6` db mount · `e32e50b` kommune loader · `7ccf9ee` api endpoints · `7be3aa5` web map · `e12cbbd` seed.

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
