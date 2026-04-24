# Data Sources

Every fact in this project is traceable to a source in this table. If a number doesn't have an entry here, it shouldn't be in the database.

Status legend: 🟢 integrated · 🟡 partial / in progress · 🔴 not yet · ⚫ one-shot (no ongoing sync)

## Tier 1 — Structured, official, API-accessible

| # | Source | URL | What we extract | Status | Notes |
|---|---|---|---|---|---|
| 1 | **Nkom registered data center operators** | https://nkom.no/datasenter/oversikt | Operator name, org nr, self-declared site addresses | 🔴 | 58 entries as of Apr 2026. Bootstrap seed list. Check if there's a CSV/JSON export; otherwise scrape. |
| 2 | **Brønnøysundregistrene (Enhetsregisteret)** | https://data.brreg.no/enhetsregisteret/api | Org nr → name, address, NACE code, roles, owners | 🔴 | Free, no auth, NLOD-licensed. Subscribe endpoint for updates. |
| 3 | **BRREG Roller** | https://data.brreg.no/enhetsregisteret/api/enheter/{orgnr}/roller | Ownership + board roles | 🔴 | For ownership chains. |
| 4 | **NVE open data / konsesjonssaker** | https://api.nve.no · https://www.nve.no/konsesjon/ | Grid-connection concessions, MW figures for large sites | 🔴 | api.nve.no is mostly hydrology; konsesjon cases may need scraping the public register. |
| 5 | **Kartverket — kommune boundaries** | https://ws.geonorge.no · https://kartkatalog.geonorge.no | Multipolygon geometry per kommune (SRID 4326), kommune codes | 🔴 | Use GeoJSON download, load into PostGIS once. |
| 6 | **Kartverket geocoding (Adressesøk)** | https://ws.geonorge.no/adresser/v1/ | Address → lat/lng | 🔴 | Free, generous rate limit. |
| 7 | **SSB Statistikkbanken — kommune electricity** | https://data.ssb.no/api/v0/ | Total electricity consumption per kommune (GWh/year) | 🔴 | Table 10314 "Nettoforbruk av elektrisk kraft" (verify). Updated annually. |
| 8 | **data.norge.no API catalog** | https://data.norge.no | Discovery for any Norwegian open dataset | ⚫ | Reference, not a continuous feed. |

## Tier 2 — Semi-structured scraping + AI extraction

| # | Source | URL | What we extract | Status | Notes |
|---|---|---|---|---|---|
| 9 | **Microsoft News** | https://news.microsoft.com/europe/ | Announcements re Norway data centers | 🔴 | Keyword filter: "Norway" + "data center". Feed to Claude. |
| 10 | **Google Cloud blog** | https://cloud.google.com/blog/products/infrastructure | Regional launches | 🔴 | Currently Skien. |
| 11 | **Meta Newsroom** | https://about.fb.com/news/ | Infrastructure announcements | 🔴 | |
| 12 | **Green Mountain** | https://greenmountain.no/news | MW, customer announcements (TikTok Hamar) | 🔴 | |
| 13 | **Bulk Infrastructure** | https://www.bulkinfrastructure.com/news | Støleheia, Oslo expansions | 🔴 | |
| 14 | **GreenScale** | (check) | Ertsmyra/Sirdal project | 🔴 | |
| 15 | **Skygard** | (check) | | 🔴 | |
| 16 | **E24 archive** | https://e24.no | News about specific sites, capacity changes | 🔴 | Use search + scraper. |
| 17 | **Digi.no** | https://www.digi.no | Tech industry coverage | 🔴 | |
| 18 | **Europower** | https://www.europower.no | Energy industry detail | 🔴 | Paywall on some articles — headlines + leads only. |
| 19 | **Kommune plansak portals** | varies | Building permits, zoning for data center sites | 🔴 | Per-kommune adapters. Start with: Hamar, Skien, Sirdal, Vennesla, Rennesøy. |
| 20 | **Annual reports (PDF)** | varies | Capacity, power, financial tie-backs | 🔴 | Green Mountain, Bulk publish these. Claude PDF extraction. |

## Tier 3 — Manual, one-shot reference

| # | Source | URL | What we take | Status |
|---|---|---|---|---|
| 21 | Rogaland FK kunnskapsgrunnlag | https://www.rogfk.no (PDF) | Regional analysis for Sirdal area | ⚫ |
| 22 | Analysys Mason reports | — | Industry-level MW estimates | ⚫ |
| 23 | NVE reports on kraftforbruk | https://www.nve.no | National-level context | ⚫ |

## Extraction schema

Every AI extraction run produces this JSON. Stored in `extraction_runs.result_json`, then distilled into `data_centers` + `capacity_observations`:

```json
{
  "name": "string",
  "operator_org": {"brreg_org_nr": "string|null", "name": "string"},
  "owner_ultimate": {"name": "string", "country": "ISO-2"},
  "location": {"kommune_code": "string", "address": "string|null", "lat": 0, "lng": 0},
  "status": "planned|under_construction|operational|decommissioned",
  "capacity_mw": {"current": 0, "planned_max": 0, "unit": "MW"},
  "source": {"url": "string", "published_at": "ISO-8601", "quoted_text": "string"},
  "confidence": 0.0,
  "notes": "string"
}
```

## Rules of engagement

1. **No number without a `source_id`.** Every `capacity_observations` row points at a `sources` row.
2. **Confidence is explicit.** The UI always shows a confidence bar next to MW figures.
3. **Snapshots.** When we scrape a source, we save the HTML/PDF to `infra/snapshots/{source_id}/` so we can re-extract if the page changes or disappears.
4. **Respect robots.txt and rate limits.** 1 request/sec per domain default; back off on 429s.
5. **Attribution in UI.** Every data center detail page lists its sources as clickable links.
