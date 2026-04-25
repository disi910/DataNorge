import typer
from loguru import logger

app = typer.Typer(help="Datasenter-Norge pipeline CLI.", no_args_is_help=True)


@app.command()
def ping() -> None:
    """Quick sanity check: can we connect to the database?"""
    from sqlalchemy import text

    from pipeline.db import engine

    with engine.connect() as conn:
        row = conn.execute(text("SELECT 1")).scalar_one()
    logger.success("DB reachable, SELECT 1 -> {}", row)


@app.command()
def load_kommuner() -> None:
    """Load Norwegian kommune polygons (Kartverket) + electricity totals (SSB)."""
    from pipeline.jobs.load_kommuner import run

    run()


@app.command()
def scrape_nkom() -> None:
    """[Deprecated] HTML scrape of Nkom list. Prefer load-nkom-operators."""
    from pipeline.jobs.scrape_nkom import run

    run()


@app.command()
def load_nkom_operators() -> None:
    """Load the authoritative Nkom operator list from the 2026-03-20 PDF."""
    from pipeline.jobs.load_nkom_operators import run

    run()


@app.command()
def load_ssb_electricity() -> None:
    """Load SSB population + electricity per kommune (heat overlay inputs)."""
    from pipeline.jobs.load_ssb_electricity import run

    run()


@app.command()
def enrich_brreg(force: bool = False) -> None:
    """Enrich organizations with BRREG data (address, NACE, authoritative name)."""
    from pipeline.jobs.enrich_brreg import run

    run(force=force)


@app.command()
def seed_top_sites() -> None:
    """Seed hand-curated top Norwegian data centers from db/seed/top_sites.json."""
    from pipeline.jobs.seed_top_sites import run

    run()


@app.command()
def seed_research_sites() -> None:
    """Seed Pass-1 research sites from db/seed/operator_sites_research.json."""
    from pipeline.jobs.seed_top_sites import run

    run("operator_sites_research.json")


@app.command()
def load_key_articles() -> None:
    """Load curated key articles into the sources table."""
    from pipeline.jobs.load_key_articles import run

    run()


if __name__ == "__main__":
    app()
