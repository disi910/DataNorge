# /infra

- `docker-compose.yml` — local dev stack (postgres+postgis, api, web).
- `Dockerfile.api`, `Dockerfile.web`, `Dockerfile.pipeline` — per-service images.
- `Dockerfile.web.prod` + `nginx.web.conf` — production web image (static build served by nginx).
- `snapshots/` — archived HTML/PDF from scrapers (gitignored; re-fetchable).

## Production (sub-path)

The site is hosted at `didriksi.com/datanorge/` from the [Portfolio](https://github.com/disi910/Portfolio) repo, which includes this repo as a submodule and runs `db`, `api` and the production web image in its own compose file. The web image takes two build args:

- `VITE_BASE_PATH` — URL prefix the app is served under (`/datanorge/`). Defaults to `/`, so local dev is unchanged.
- `VITE_API_BASE_URL` — where the browser reaches the API (`/datanorge/api`).

The reverse proxy strips the prefix before forwarding to the web container and the API.
