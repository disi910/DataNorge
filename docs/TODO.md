# TODO

## Map: redesign to design-system version

The current map (`apps/web/src/components/NorwayMap.tsx`) uses MapLibre + OSM
raster tiles. The Datasenter-Norge handoff design (`Datasenter-Norge.html`)
specifies a hand-drawn editorial silhouette map with:

- Cobalt/chalk palette (`#1d49c7` on `#fbf8f1`)
- SVG silhouette of Norway (single path, optional `wobble-soft` displacement filter)
- Graticule + lat labels (71°N, 66°N, 61°N, 56°N)
- Statnett price-area labels (NO1–NO5)
- Coast tick (dashed cobalt offset)
- Sized dots: solid blue for operational (area = MW, √-scaled), hollow dashed
  for planned/under-construction
- Fixed callouts for the giants (Hamar 90 MW, Vennesla 1 GW grid, Stargate 520 MW)
- Compass + scale bar
- Legend + totals overlays already exist (`SidePanels.tsx`)

The current MapLibre version is kept for the working data layer; replace it
with the design version once kommune coordinates are wired into a static
viewport (or once we have proper GeoJSON for Norway and price-areas).
