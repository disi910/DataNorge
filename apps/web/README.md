# apps/web — React + TS + Vite

Frontend for Datasenter-Norge: map of Norway + list of data centers.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **MapLibre GL** for the map (OSM raster tiles for now; will swap to Kartverket WMTS)
- **Tailwind** for styling (monochrome palette: `ink`, `paper`, `accent`)
- **IBM Plex Sans / Mono** for typography

## Local dev

```bash
# via docker compose (recommended)
cd infra && docker compose up web

# or standalone
cd apps/web
npm install
npm run dev
```

Then open http://localhost:5173.

## Layout

```
apps/web/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    └── components/
        ├── NorwayMap.tsx
        └── DataCenterList.tsx
```

The list currently renders 6 hard-coded placeholder rows. It'll hit the API
(`GET /data-centers`) once M1 seed data lands.
