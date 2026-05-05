# Methodology

*(This page is rendered verbatim at `/methodology` on the public site. Written in plain Norwegian + English so journalists can cite it.)*

## What we claim, and how certain we are

Every data center on this site has figures attached: megawatts of power, kommune, ownership. **These numbers are not official.** Norway has no single authority that publishes a "how much power does each data center consume" dataset. We piece the picture together from public, verifiable sources, and we tell you how confident we are.

## The macro picture (April 2026)

Cited from Nkom, NVE/Statnett (LA25 + Områdeplaner), SSB, Stortinget Innst. 140S 2025-2026, Energiteknikk, Altinget and the FriFagbevegelse / LO Magasinet feature *"Datasentre i Norge kan nesten tredoble sitt strømforbruk"* (Erlend Tro Klette, 26 February 2026):

- **104** data centers in operation, **55** commercial operators (Nkom, 20 March 2026).

### Consumption trajectory, not a snapshot

The story is the slope. The 2.1 TWh figure that gets repeated everywhere is the audited 2024 number. By the time you read this in April 2026 it is roughly 18 months stale.

| Year | Consumption | Basis |
|---|---|---|
| 2022 | ~0.7 TWh | NVE / Energiteknikk |
| 2023 | ~1.6 TWh | NVE / Altinget |
| 2024 | **2.1 TWh** (audited) | SSB / Digdir, ~1.5 % of national |
| 2025 | ~2.8-3.1 TWh | Annualised from NVE 1H 2025 actuals (1.4 TWh, +50 % y/y) |
| 2026 | ~2.6-3.4 TWh (projected) | Trajectory plus known 2025-26 commissionings: AQ-OSL1B/1C, Bulk OS-IX doubling, Polar DRA1, Nscale Glomfjord ramp, Bulk N01 expansion, Green Mountain Hamar build-out toward 150 MW |

NVE's LA25 long-term outlook then projects **~6 TWh by 2030, ~8 TWh by 2035, ~10 TWh by 2040, ~13 TWh by 2050**. The doubling from 2026's ~3 TWh to 6 TWh by 2030 is far more plausible than the same projection from a 2.1 TWh base.

### Installed capacity and reserved grid

- **Operational installed capacity (April 2026)**: roughly **600-700 MW** across named sites (Table 2A of the April 2026 inventory) plus ~50-70 MW in long-tail captive/crypto operators. The 501 MW figure from 2024 (six biggest operators, 150 MW actually drawn) predates the 2025 build-outs and is no longer a useful reference number.
- **Statnett reserved grid capacity for data centres (Dec 2025)**: **3 363 MW**, with another **4 465 MW** in the mature project queue, out of total reserved new load of 8 004 MW and a total queue of 12 465 MW. Data centres alone are **~36 % of all reserved load and ~50 % of the queue** (Stortinget Innst. 140S 2025-2026).
- At full and even uptake, 3 363 MW would equal **20-30 TWh/yr**, between half and three-quarters of all Norwegian household electricity consumption (40.9 TWh in 2024). The Ministry, NVE and Statnett all stress that **realistically only ~50 % of reservations convert** to physical capacity. Realised 2024 load was ~240 MW average, i.e. roughly 7 % of reservations.

## How we collect data

1. **Operator list**: from the official **Nkom registry** (https://nkom.no/datasenter/oversikt). Authoritative count as of **20 March 2026**: **55 commercial operators**, **104 data centers in operation** (incl. captive/in-house sites).
2. **Company and ownership**: **Brønnøysundregistrene (BRREG)** open API. We follow ownership chains from the Norwegian operating entity to its ultimate parent when disclosed.
3. **Locations**: geocoded via **Kartverket adressesøk**. Where an exact address isn't public, we use the kommune centroid and mark the point as approximate.
4. **Power capacity (MW)**: from press releases, annual reports, NVE concession filings, kommune planning documents and reputable trade press (DCD, TU, Digi.no, E24, NRK, Capacity, Computer Weekly). Some site-level extraction is assisted by **Anthropic's Claude**; every extraction is reviewed against the source quote and saved for audit.
5. **Kommune electricity totals**: **SSB Statistikkbanken**, "nettoforbruk av elektrisk kraft", the most recent published year.

## Confidence scoring

Each MW figure carries a confidence score 0.0-1.0:

| Score | Meaning |
|---|---|
| 0.9-1.0 | Stated directly in an official filing (NVE concession, Statnett reservation, audited annual report) |
| 0.7-0.9 | Stated in a corporate press release, operator's own website, or reputable trade press citing one |
| 0.5-0.7 | Inferred from reporting by E24 / Digi.no / Europower / DCD / Capacity |
| 0.3-0.5 | Estimated from secondary indicators (site size, grid capacity) or directories like DataCenterMap, Baxtel |
| < 0.3 | Shown only as a rough band; not used in aggregate claims |

The UI renders confidence as a bar next to every number. Figures below 0.5 are shown with a clear "estimated" label and are not included in kommune-level totals.

## How we compare to a kommune's electricity use

For the kommune heat overlay we compute, for each named operational site:

```
upper_bound_share = (sum_of_MW_for_kommune × 8760 h/year) / (kommune_total_GWh × 1000)
realistic_band    = upper_bound_share × [0.40, 0.70]
```

The 100 % utilization figure is shown only as the absolute ceiling. The headline number on each site detail is the **realistic 40-70 % band**, because real data centres do not run flat-out. Showing a band rather than a single point is both more honest and harder to dismiss when the numbers are checked against SSB.

## What we don't do

- **We don't guess** when a source says nothing. Unknown MW shows as "unknown", not a made-up number. Hyperscaler regions (Microsoft, Google's pre-go-live phase) are deliberately marked unknown rather than estimated.
- **We don't lobby.** The site reports facts. Interpretation is up to readers (see the *Redaksjonelt* page for our own commentary, kept separate).
- **We don't real-time.** Power draw in the moment isn't available to us.
- **We don't track tenants.** We know which operator runs a site, not which of their customers is in which rack.

## Corrections

Spotted an error? Open an issue on GitHub or email *(TBD contact)*. We keep a public changelog of corrections.

## License

Code: MIT. Dataset: CC BY 4.0. Attribution to "Datasenter-Norge" is appreciated.
