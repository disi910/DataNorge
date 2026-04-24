# Methodology

*(This page is rendered verbatim at `/methodology` on the public site. Written in plain Norwegian + English so journalists can cite it.)*

## What we claim, and how certain we are

Every data center on this site has figures attached: megawatts of power, kommune, ownership. **These numbers are not official.** Norway has no single authority that publishes a "how much power does each data center consume" dataset. We piece the picture together from public, verifiable sources, and we tell you how confident we are.

## How we collect data

1. **Operator list**: bootstrapped from **Nkom's registry** (https://nkom.no/datasenter/oversikt) — 58 operators as of April 2026.
2. **Company and ownership**: **Brønnøysundregistrene (BRREG)** open API. We follow ownership chains from the Norwegian operating entity to its ultimate parent when disclosed.
3. **Locations**: geocoded via **Kartverket adressesøk**. Where an exact address isn't public, we use the kommune centroid and mark the point as approximate.
4. **Power capacity (MW)**: from press releases, annual reports, NVE concession filings, and kommune planning documents. We use **Anthropic's Claude** (a large language model) to extract structured numbers from unstructured text — every extraction is reviewed against the source quote and saved for audit.
5. **Kommune electricity totals**: **SSB Statistikkbanken**, "nettoforbruk av elektrisk kraft", the most recent published year.

## Confidence scoring

Each MW figure carries a confidence score 0.0–1.0:

| Score | Meaning |
|---|---|
| 0.9–1.0 | Stated directly in an official filing (NVE concession, grid operator agreement) |
| 0.7–0.9 | Stated in a corporate press release or annual report |
| 0.5–0.7 | Inferred from reporting by a reputable outlet (E24, Digi.no, Europower) |
| 0.3–0.5 | Estimated from secondary indicators (site size, grid capacity) |
| < 0.3 | Shown only as a rough band; not used in aggregate claims |

The UI renders confidence as a bar next to every number. Figures below 0.5 are shown with a clear "estimated" label and are not included in kommune-level totals.

## How we compare to a kommune's electricity use

For the kommune heat overlay, we compute:

```
share = (sum_of_MW_for_kommune × 8760 h/year) / (kommune_total_GWh × 1000)
```

This assumes 100% utilization. **Real utilization is lower** (typically 40–70%), so the headline share is an *upper bound*. The detail view shows both the upper-bound share and a utilization-adjusted band.

## What we don't do

- **We don't guess** when a source says nothing. Unknown MW → shown as "unknown", not a made-up number.
- **We don't lobby.** The site reports facts. Interpretation is up to readers.
- **We don't real-time.** Power draw in the moment isn't available to us.
- **We don't track tenants.** We know which operator runs a site, not which of their customers is in which rack.

## Corrections

Spotted an error? Open an issue on GitHub or email *(TBD contact)*. We keep a public changelog of corrections.

## License

Code: MIT. Dataset: CC BY 4.0. Attribution to "Datasenter-Norge" is appreciated.
