# Database schema

Postgres 16 + PostGIS. All geometries SRID 4326 (WGS84).

## Tables

### `kommuner`
Reference table for Norwegian municipalities. Loaded once from Kartverket + SSB.

| column | type | notes |
|---|---|---|
| `code` | `text PK` | 4-digit kommune code (e.g. `"3401"` = Hamar) |
| `name` | `text` | |
| `fylke_code` | `text` | |
| `geometry` | `geometry(MultiPolygon, 4326)` | GIST index |
| `population` | `int` | SSB, annual |
| `total_electricity_gwh_year` | `numeric` | SSB netto kraftforbruk, annual |
| `electricity_year` | `int` | which year the above refers to |
| `updated_at` | `timestamptz` | |

### `organizations`
Companies, as known to BRREG (plus foreign parents we add manually).

| column | type | notes |
|---|---|---|
| `id` | `uuid PK` | |
| `brreg_org_nr` | `text UNIQUE NULL` | NULL for foreign parents not in BRREG |
| `name` | `text NOT NULL` | |
| `country` | `text` | ISO-2, default `"NO"` |
| `parent_org_id` | `uuid REFERENCES organizations(id) NULL` | ownership chain |
| `nace_code` | `text NULL` | from BRREG |
| `registered_address` | `text NULL` | |
| `raw_brreg_json` | `jsonb NULL` | last BRREG response for debugging |
| `first_seen` | `timestamptz` | |
| `last_verified` | `timestamptz` | |

Index: `(parent_org_id)` for chain traversal.

### `data_centers`
The core entity.

| column | type | notes |
|---|---|---|
| `id` | `uuid PK` | |
| `name` | `text NOT NULL` | human-readable, e.g. "Green Mountain DC1-Stavanger" |
| `operator_org_id` | `uuid REFERENCES organizations(id)` | who runs the site |
| `owner_ultimate_org_id` | `uuid REFERENCES organizations(id)` | resolved parent, cached for display |
| `kommune_code` | `text REFERENCES kommuner(code)` | |
| `location` | `geometry(Point, 4326)` | GIST index. Derived from geocoded address. |
| `address` | `text NULL` | human-readable |
| `status` | `text CHECK (status IN ('planned','under_construction','operational','decommissioned'))` | |
| `site_type` | `text NULL` | colocation, hyperscaler, edge, etc. |
| `first_seen` | `timestamptz` | |
| `last_verified` | `timestamptz` | |
| `notes` | `text NULL` | editorial |

Unique constraint: `(operator_org_id, name)` — avoid dupes from re-extraction.

### `capacity_observations`
Many-to-one with `data_centers`. Every MW figure is an observation tied to a source.

| column | type | notes |
|---|---|---|
| `id` | `uuid PK` | |
| `data_center_id` | `uuid REFERENCES data_centers(id) ON DELETE CASCADE` | |
| `mw_current` | `numeric NULL` | |
| `mw_planned_max` | `numeric NULL` | |
| `observed_at` | `date` | when the source was published |
| `source_id` | `uuid REFERENCES sources(id)` | |
| `confidence` | `numeric CHECK (confidence BETWEEN 0 AND 1)` | |
| `extracted_by` | `text` | `"manual"`, `"claude-sonnet-4.6"`, etc. |
| `created_at` | `timestamptz` | |

### `sources`
Every URL/document we've touched.

| column | type | notes |
|---|---|---|
| `id` | `uuid PK` | |
| `url` | `text` | |
| `title` | `text` | |
| `published_at` | `timestamptz NULL` | |
| `source_type` | `text` | `press_release`, `kommune_plansak`, `nve_concession`, `annual_report`, `news`, `registry` |
| `domain` | `text` | `news.microsoft.com`, etc. |
| `snapshot_path` | `text NULL` | relative path to archived HTML/PDF |
| `fetched_at` | `timestamptz` | |
| `http_status` | `int` | |

Index: `(domain, fetched_at)`.

### `extraction_runs`
Audit trail for every AI call.

| column | type | notes |
|---|---|---|
| `id` | `uuid PK` | |
| `source_id` | `uuid REFERENCES sources(id)` | |
| `model` | `text` | e.g. `claude-sonnet-4-6` |
| `prompt_version` | `text` | bump when we change the extractor prompt |
| `tokens_in` | `int` | |
| `tokens_out` | `int` | |
| `cost_usd` | `numeric` | |
| `result_json` | `jsonb` | the raw extraction output |
| `created_at` | `timestamptz` | |

## Views (or materialized views)

- `v_data_center_latest_capacity` — for each `data_center_id`, the most recent `capacity_observations` row (by `observed_at DESC`). Drives the list and map.
- `mv_kommune_dc_share` — materialized view joining `data_centers` → `kommuner`, summing `mw_current`, computing `share_of_kommune_electricity = sum_mw * 8760h / (total_electricity_gwh_year * 1000)`. Refreshed nightly.

## API shapes (derived)

- `GET /data-centers` → `FeatureCollection<Point>` with properties `{id, name, operator, owner_country, status, mw_current, mw_planned_max, confidence, kommune_code, kommune_name}`
- `GET /data-centers/{id}` → full detail, including `capacity_observations[]`, `sources[]`, `ownership_chain[]`
- `GET /kommuner` → `FeatureCollection<MultiPolygon>` with `{code, name, total_electricity_gwh_year, dc_mw_total, dc_share}`
- `GET /radar?since=...` → recent extractions, newest first
