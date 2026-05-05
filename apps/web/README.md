# apps/web — React + TS + Vite

Frontend for Datasenter-Norge: the **Register Datasenter Norge** page — a non-scrolling two-column register of Norway's data centers with a searchable + filterable + sortable list on the left and a MapLibre map on the right.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **MapLibre GL** for the map (OSM raster tiles)
- **Tailwind** for utility styling; component-level styles are inline in `RegisterApp.tsx` to match the editorial design exactly
- Helvetica Neue / system sans for the register; Instrument Serif still loaded for legacy components

## Local dev

```bash
# via docker compose (recommended)
cd infra && docker compose up web

# or standalone
cd apps/web
npm install
npm run dev          # http://localhost:5173 by default; .claude/launch.json pins 5180 for Claude Preview
npm run typecheck    # tsc --noEmit
npm run build        # tsc -b && vite build
```

The web app reads `VITE_API_BASE_URL` (default `http://localhost:8001`) to find the API.

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
    ├── App.tsx                  → renders <RegisterApp />
    ├── api.ts                   → fetch helpers + types
    ├── index.css
    └── components/
        ├── RegisterApp.tsx      → primary register page (header / list+map / footer)
        ├── NorwayMap.tsx        → MapLibre wrapper, status-coloured markers
        └── …                    → legacy editorial / detail components, currently unused
```

The list reads `GET /data-centers`. Selecting a row pans the map and opens the detail flyout.
