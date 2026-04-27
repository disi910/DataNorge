import { useCallback, useState } from "react";
import { NorwayMap } from "./components/NorwayMap";
import { DataCenterList } from "./components/DataCenterList";
import { DetailCard } from "./components/DataCenterDetail";
import { Masthead, type Tab } from "./components/Masthead";
import { StatsRibbon } from "./components/StatsRibbon";
import { MapLegendOverlay, MapTotalsOverlay, OwnershipBars, StatusTable } from "./components/SidePanels";
import { EditorialPage } from "./components/EditorialPage";
import { MethodPage } from "./components/MethodPage";
import { SourcesPage } from "./components/SourcesPage";
import { MacroStrip } from "./components/MacroStrip";
import type { DataCenterProps } from "./api";

// TODO(map): Replace MapLibre raster map with a design-system illustrative
// SVG/silhouette map matching `Datasenter-Norge.html` (cobalt/chalk dots,
// graticule, price-area labels, callouts). Keeping the current MapLibre
// implementation for now.

export default function App() {
  const [tab, setTab] = useState<Tab>("kart");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [items, setItems] = useState<DataCenterProps[]>([]);
  const onItemsLoaded = useCallback((list: DataCenterProps[]) => setItems(list), []);

  const totalCount = items.length;
  const plannedCount = items.filter((s) => s.status !== "operational").length;
  const longtailCount = Math.max(0, totalCount - 25);

  return (
    <div className="paper" style={{ minHeight: "100vh", padding: "36px 56px 28px" }}>
      <Masthead activeTab={tab} setActiveTab={setTab} totalCount={totalCount} longtailCount={longtailCount} plannedCount={plannedCount}/>
      <MacroStrip/>
      <StatsRibbon/>

      {tab === "kart" && (
        <div className="grid" style={{ gridTemplateColumns: "minmax(420px, 1fr) minmax(560px, 760px) minmax(340px, 1fr)", gap: 28, marginTop: 16 }}>
          {/* LEFT: list */}
          <div>
            <DataCenterList
              selectedId={selectedId}
              onSelect={setSelectedId}
              onHover={setHoverId}
              onItemsLoaded={onItemsLoaded}
            />
          </div>

          {/* CENTER: map */}
          <div className="relative">
            <div
              className="h-mono uppercase flex justify-between mb-1.5 pb-1.5"
              style={{ fontSize: 10, letterSpacing: "0.22em", borderBottom: "1px solid #0e1a2b" }}
            >
              <span>Plate I - Geografisk fordeling, april 2026</span>
              <span className="text-muted">MapLibre · OSM · TODO redesign</span>
            </div>
            <div className="relative" style={{ border: "1px solid #0e1a2b", background: "#fbf8f1", padding: 4, height: 1100 }}>
              <div className="absolute" style={{ inset: 4 }}>
                <NorwayMap selectedId={selectedId} onSelect={setSelectedId}/>
              </div>
              <MapLegendOverlay/>
              <MapTotalsOverlay items={items}/>
            </div>
            <div className="h-mono text-muted" style={{ fontSize: 9.5, marginTop: 8, letterSpacing: "0.05em", lineHeight: 1.5 }}>
              Sirkelareal (i designversjonen) proporsjonal med driftet eller planlagt MW. Den nåværende kartimplementasjonen
              er en MapLibre-versjon - pixel-perfekt designversjon kommer.
            </div>
          </div>

          {/* RIGHT: detail + side tables */}
          <div className="flex flex-col gap-4">
            <div>
              <div
                className="h-mono uppercase mb-1.5 pb-1.5"
                style={{ fontSize: 10, letterSpacing: "0.22em", borderBottom: "1px solid #0e1a2b" }}
              >
                Anlegg · detaljer
              </div>
              <DetailCard id={selectedId ?? hoverId}/>
            </div>

            <div>
              <div
                className="h-mono uppercase mb-1.5 pb-1.5"
                style={{ fontSize: 10, letterSpacing: "0.22em", borderBottom: "1px solid #0e1a2b" }}
              >
                Status · effekt &amp; antall
              </div>
              <StatusTable items={items}/>
            </div>

            <div>
              <div
                className="h-mono uppercase mb-1.5 pb-1.5"
                style={{ fontSize: 10, letterSpacing: "0.22em", borderBottom: "1px solid #0e1a2b" }}
              >
                Eierskap · øverste mor­selskap
              </div>
              <OwnershipBars items={items}/>
            </div>
          </div>
        </div>
      )}

      {tab === "redaksjonelt" && <EditorialPage/>}
      {tab === "metode" && <MethodPage/>}
      {tab === "kilder" && <SourcesPage/>}

      <div
        className="flex justify-between h-mono uppercase text-muted"
        style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid #0e1a2b", fontSize: 9.5, letterSpacing: "0.16em" }}
      >
        <span>Datasenter-Norge · åpen data · morgenutgave</span>
        <span>Kilder: Nkom · NVE · Statnett · SSB · BRREG · Kartverket · E24</span>
        <span>sist verifisert 25.04.2026 · register 2026/04</span>
      </div>
    </div>
  );
}
