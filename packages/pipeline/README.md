# packages/pipeline

Data pipeline for Datasenter-Norge: fetchers, parsers, AI extractors, loaders.

## Run jobs

All jobs go through the `pipeline` CLI (installed by the api container's pip install):

```bash
# from the host
docker exec datasenter-api pipeline --help
docker exec datasenter-api pipeline ping           # sanity check
docker exec datasenter-api pipeline load-kommuner  # Kartverket polygons
```

## Layout

```
packages/pipeline/
├── pyproject.toml
├── pipeline/
│   ├── __init__.py
│   ├── cli.py          Typer CLI entry point
│   ├── config.py       pydantic-settings
│   ├── db.py           SQLAlchemy engine
│   ├── http.py         httpx wrapper with UA + logging
│   └── jobs/           one module per loader / scraper
│       ├── __init__.py
│       └── load_kommuner.py
```

## Jobs roadmap (M1)

- [x] `load-kommuner` — Kartverket polygons via robhop/fylker-og-kommuner
- [ ] `load-electricity` — SSB electricity per kommune (fylke-level, distributed by population)
- [ ] `scrape-nkom` — Nkom registered operators list
- [ ] `enrich-brreg` — BRREG lookup per operator
- [ ] `seed-top20` — hand-curated top sites with known MW
