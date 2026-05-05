# TODO

## Map: optional design-system silhouette

The current map (`apps/web/src/components/NorwayMap.tsx`) uses MapLibre + OSM
raster tiles, with markers coloured by status (operational green, under
construction amber, planned slate, decommissioned grey) and sized by MW.
This is the shipped design.

The Datasenter-Norge handoff also includes a hand-drawn editorial silhouette
variant (`Datasenter-Norge.html`): SVG silhouette of Norway, graticule with
71/66/61/56 °N labels, NO1–NO5 price-area labels, dashed coast tick, callouts
for the giants (Hamar 90 MW, Vennesla 1 GW grid, Stargate 520 MW), compass +
scale bar. Not adopted — keeping the OSM map per user direction.

If we ever want both, render them as alternatives behind a toggle rather than
replacing the live data layer.

## Data backlog

- Real Statnett price-area lookup per kommune (currently a rough lat/lng
  bucket in `RegisterApp.regionFor`).
- Server-side `kind` (`hyper`/`ai`/`colo`/`krypto`) instead of the
  keyword-heuristic in `RegisterApp.classify`.
- More sites: Nkom currently shows 58 named operators; `+ 73 anonyme captive`
  remain unattributed.
