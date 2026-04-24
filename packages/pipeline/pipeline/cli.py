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
def seed_top_sites() -> None:
    """Seed hand-curated top Norwegian data centers from db/seed/top_sites.json."""
    from pipeline.jobs.seed_top_sites import run

    run()


if __name__ == "__main__":
    app()
