import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { fetchDataCenters, fetchKommuner, type FC, type DataCenterProps, type KommuneProps } from "../api";

const NORWAY_CENTER: [number, number] = [15.0, 65.0];
const INITIAL_ZOOM = 4.2;

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function NorwayMap({ selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const dcDataRef = useRef<FC<DataCenterProps> | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap · Kartverket (kommuner, CC BY 4.0)",
          },
        },
        layers: [
          { id: "bg", type: "background", paint: { "background-color": "#f7f5f0" } },
          { id: "osm", type: "raster", source: "osm" },
        ],
      },
      center: NORWAY_CENTER,
      zoom: INITIAL_ZOOM,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("error", (e) => console.error("[maplibre error]", e));
    console.log("[NorwayMap] map instance created", containerRef.current?.getBoundingClientRect());

    map.on("load", async () => {
      try {
        const [kommuner, dataCenters] = await Promise.all([
          fetchKommuner(),
          fetchDataCenters(),
        ]);
        dcDataRef.current = dataCenters;
        addKommuner(map, kommuner);
        addDataCenters(map, dataCenters, (id) => onSelectRef.current(id));
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

  useEffect(() => {
    const map = mapRef.current;
    const data = dcDataRef.current;
    if (!map || !data || !loaded) return;
    if (map.getLayer("data-centers-selected")) {
      map.setFilter("data-centers-selected", ["==", ["get", "id"], selectedId ?? ""]);
    }
    if (selectedId) {
      const feat = data.features.find((f) => f.properties.id === selectedId);
      if (feat) {
        const c = (feat.geometry as GeoJSON.Point).coordinates as [number, number];
        map.flyTo({ center: c, zoom: Math.max(map.getZoom(), 6.5), duration: 600 });
      }
    }
  }, [selectedId, loaded]);

  return (
    <>
      <div ref={containerRef} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }} />
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-ink/60" style={{ fontSize: 14, fontStyle: "italic" }}>
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

function addDataCenters(
  map: maplibregl.Map,
  data: FC<DataCenterProps>,
  onSelect: (id: string) => void,
) {
  map.addSource("data-centers", { type: "geojson", data });

  map.addLayer({
    id: "data-centers-circle",
    type: "circle",
    source: "data-centers",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["coalesce", ["get", "mw_current"], ["get", "mw_planned_max"], 5],
        0, 4,
        50, 10,
        200, 20,
        500, 32,
      ],
      "circle-color": [
        "match",
        ["get", "status"],
        "operational",        "#15171a",
        "under_construction", "#6c6f76",
        "planned",            "#a4a7ad",
        "decommissioned",     "#c8cacd",
        "#15171a",
      ],
      "circle-opacity": 0.85,
      "circle-stroke-color": "#15171a",
      "circle-stroke-width": 1,
    },
  });

  map.on("click", "data-centers-circle", (e) => {
    const f = e.features?.[0];
    if (!f) return;
    const p = f.properties as DataCenterProps;
    const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];
    onSelect(p.id);
    map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 6.5), duration: 600 });
  });

  map.addLayer({
    id: "data-centers-selected",
    type: "circle",
    source: "data-centers",
    filter: ["==", ["get", "id"], ""],
    paint: {
      "circle-radius": [
        "interpolate", ["linear"],
        ["coalesce", ["get", "mw_current"], ["get", "mw_planned_max"], 5],
        0, 8, 50, 14, 200, 26, 500, 38,
      ],
      "circle-color": "transparent",
      "circle-stroke-color": "#15171a",
      "circle-stroke-width": 2.5,
    },
  });

  map.on("mouseenter", "data-centers-circle", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "data-centers-circle", () => {
    map.getCanvas().style.cursor = "";
  });
}

