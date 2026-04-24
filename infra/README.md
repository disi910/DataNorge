# /infra

- `docker-compose.yml` — local dev stack (postgres+postgis, api, web).
- `Dockerfile.api`, `Dockerfile.web`, `Dockerfile.pipeline` — per-service images.
- `snapshots/` — archived HTML/PDF from scrapers (gitignored; re-fetchable).

Production deploy is out of scope for now — local dev only.
