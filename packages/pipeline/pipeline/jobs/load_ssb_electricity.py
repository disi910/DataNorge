"""Load SSB population + net electricity consumption per kommune.

- Table 10314 (NtoForbKraftGrKom): "Net consumption of electricity (GWh), by
  region, consumer group, contents and year" — covers 2010-2023, all kommuner.
  We pick consumer group "00" = total, latest year available per kommune.
- Table 11342: Population per kommune (1 Jan), ContentsCode "Folkemengde".

Note: SSB returns 2020 kommune codes for some legacy tables, but 10314 uses
post-2020 codes that match our kommuner.code values.

This populates kommuner.fylke_code, .population, .total_electricity_gwh_year,
.electricity_year — the inputs the web map needs to render the heat overlay.
"""
from __future__ import annotations

from loguru import logger
from sqlalchemy import text

from pipeline.db import engine
from pipeline.http import client


def _query(table_id: str, body: dict) -> dict:
    url = f"https://data.ssb.no/api/v0/en/table/{table_id}"
    with client(timeout=30) as c:
        r = c.post(url, json=body)
        r.raise_for_status()
        return r.json()


def _decode_jsonstat(data: dict, dim_filters: dict[str, str]) -> dict[tuple, float | int | None]:
    """Return {(region_code, year): value} after fixing other dims to single chosen value."""
    dims = data["id"]
    sizes = data["size"]
    indexes = {d: data["dimension"][d]["category"]["index"] for d in dims}
    values = data["value"]
    strides = [1] * len(dims)
    for i in range(len(dims) - 2, -1, -1):
        strides[i] = strides[i + 1] * sizes[i + 1]

    fixed = {d: indexes[d][v] for d, v in dim_filters.items()}
    region_dim = "Region"
    time_dim = "Tid"
    out: dict[tuple, float | int | None] = {}
    for region, r_idx in indexes[region_dim].items():
        for year, t_idx in indexes[time_dim].items():
            flat = 0
            for i, d in enumerate(dims):
                if d == region_dim:
                    flat += r_idx * strides[i]
                elif d == time_dim:
                    flat += t_idx * strides[i]
                else:
                    flat += fixed[d] * strides[i]
            out[(region, year)] = values[flat] if flat < len(values) else None
    return out


def _fetch_population() -> dict[str, tuple[int, int]]:
    """Return {kommune_code: (population, year)} for the latest year with data."""
    body = {
        "query": [
            {"code": "Region", "selection": {"filter": "all", "values": ["*"]}},
            {"code": "ContentsCode", "selection": {"filter": "item", "values": ["Folkemengde"]}},
        ],
        "response": {"format": "json-stat2"},
    }
    data = _query("11342", body)
    cells = _decode_jsonstat(data, {"ContentsCode": "Folkemengde"})
    by_region: dict[str, tuple[int, int]] = {}
    for (region, year), v in cells.items():
        if len(region) != 4 or not region.isdigit() or v is None:
            continue
        y = int(year)
        prev = by_region.get(region)
        if prev is None or y > prev[1]:
            by_region[region] = (int(v), y)
    logger.info("SSB population: {} kommuner", len(by_region))
    return by_region


def _fetch_electricity() -> dict[str, tuple[float, int]]:
    """Return {kommune_code: (gwh, year)} for the latest year with data."""
    body = {
        "query": [
            {"code": "Region", "selection": {"filter": "all", "values": ["*"]}},
            {"code": "Forbrukargruppe", "selection": {"filter": "item", "values": ["00"]}},
            {"code": "ContentsCode", "selection": {"filter": "item", "values": ["ForbrukTotal"]}},
        ],
        "response": {"format": "json-stat2"},
    }
    data = _query("10314", body)
    cells = _decode_jsonstat(
        data, {"Forbrukargruppe": "00", "ContentsCode": "ForbrukTotal"}
    )
    by_region: dict[str, tuple[float, int]] = {}
    for (region, year), v in cells.items():
        if len(region) != 4 or not region.isdigit() or v is None:
            continue
        y = int(year)
        prev = by_region.get(region)
        if prev is None or y > prev[1]:
            by_region[region] = (float(v), y)
    logger.info("SSB electricity: {} kommuner", len(by_region))
    return by_region


def run() -> None:
    pop = _fetch_population()
    elec = _fetch_electricity()

    with engine.begin() as conn:
        codes = [r[0] for r in conn.execute(text("SELECT code FROM kommuner")).all()]

    n_pop = n_elec = n_missing = 0
    with engine.begin() as conn:
        for code in codes:
            p = pop.get(code)
            e = elec.get(code)
            if p:
                n_pop += 1
            if e:
                n_elec += 1
            if not p and not e:
                n_missing += 1
            conn.execute(
                text(
                    """
                    UPDATE kommuner SET
                        fylke_code = :f,
                        population = COALESCE(:pop, population),
                        total_electricity_gwh_year = COALESCE(:e, total_electricity_gwh_year),
                        electricity_year = COALESCE(:ey, electricity_year),
                        updated_at = NOW()
                    WHERE code = :c
                    """
                ),
                {
                    "c": code,
                    "f": code[:2],
                    "pop": p[0] if p else None,
                    "e": e[0] if e else None,
                    "ey": e[1] if e else None,
                },
            )

    logger.success(
        "SSB done. Population: {}/{}, Electricity: {}/{}, Both missing: {}",
        n_pop, len(codes), n_elec, len(codes), n_missing,
    )


if __name__ == "__main__":
    run()
