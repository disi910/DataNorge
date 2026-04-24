import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { fetchDataCenters, fetchKommuner, type FC, type DataCenterProps, type KommuneProps } from "../api";

const NORWAY_CENTER: [number, number] = [15.0, 65.0];
const INITIAL_ZOOM = 4.2;

export function NorwayMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap · Kartverket (kommuner, CC BY 4.0)",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: NORWAY_CENTER,
      zoom: INITIAL_ZOOM,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", async () => {
      try {
        const [kommuner, dataCenters] = await Promise.all([
          fetchKommuner(),
          fetchDataCenters(),
        ]);
        addKommuner(map, kommuner);
        addDataCenters(map, dataCenters);
      } catch (e) {
        console.error("Failed to load map data", e);
      } finally {
        setLoaded(true);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="absolute inset-0" />
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-ink/60">
          Laster kart…
        </div>
      )}
    </>
  );
}

function addKommuner(map: maplibregl.Map, data: FC<KommuneProps>) {
  map.addSource("kommuner", { type: "geojson", data });

  map.addLayer({
    id: "kommuner-fill",
    type: "fill",
    source: "kommuner",
    paint: {
      "fill-color": "#14181c",
      "fill-opacity": 0.04,
    },
  });

  map.addLayer({
    id: "kommuner-line",
    type: "line",
    source: "kommuner",
    paint: {
      "line-color": "#14181c",
      "line-opacity": 0.25,
      "line-width": 0.5,
    },
  });
}

function addDataCenters(map: maplibregl.Map, data: FC<DataCenterProps>) {
  map.addSource("data-centers", { type: "geojson", data });

  map.addLayer({
    id: "data-centers-circle",
    type: "circle",
    source: "data-centers",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["coalesce", ["get", "mw_current"], 5],
        0, 4,
        50, 10,
        200, 20,
        500, 32,
      ],
      "circle-color": [
        "match",
        ["get", "status"],
        "operational", "#1ea7a0",
        "under_construction", "#f2b705",
        "planned", "#9a9a9a",
        "decommissioned", "#8a8a8a",
        "#1ea7a0",
      ],
      "circle-opacity": 0.75,
      "circle-stroke-color": "#14181c",
      "circle-stroke-width": 1,
    },
  });

  map.on("click", "data-centers-circle", (e) => {
    const f = e.features?.[0];
    if (!f) return;
    const p = f.properties as DataCenterProps;
    const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];
    new maplibregl.Popup({ closeButton: true, offset: 12 })
      .setLngLat(coords)
      .setHTML(popupHtml(p))
      .addTo(map);
  });

  map.on("mouseenter", "data-centers-circle", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "data-centers-circle", () => {
    map.getCanvas().style.cursor = "";
  });
}

function popupHtml(p: DataCenterProps): string {
  const mw = p.mw_current ?? p.mw_planned_max;
  const mwLabel = mw !== null ? `${mw} MW` : "ukjent kapasitet";
  const kommune = p.kommune_name ?? "";
  const owner = p.owner ? `${p.owner} (${p.owner_country ?? "?"})` : "";
  return `
    <div style="font-family:'IBM Plex Sans',system-ui;min-width:220px">
      <div style="font-weight:600;font-size:14px">${escapeHtml(p.name)}</div>
      <div style="color:#666;font-size:12px;margin-top:2px">${escapeHtml(kommune)}</div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:16px;margin-top:8px">${mwLabel}</div>
      ${owner ? `<div style="color:#666;font-size:12px;margin-top:4px">Eier: ${escapeHtml(owner)}</div>` : ""}
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}
