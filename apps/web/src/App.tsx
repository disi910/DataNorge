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
import type { DataCenterProps } from "./api";

export default function App() {
  const [tab, setTab] = useState<Tab>("kart");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [items, setItems] = useState<DataCenterProps[]>([]);
  const onItemsLoaded = useCallback((list: DataCenterProps[]) => setItems(list), []);

  const totalCount = items.length;

  return (
    <div className="paper" style={{ minHeight: "100vh", padding: "36px 56px 28px" }}>
      <Masthead activeTab={tab} setActiveTab={setTab} totalCount={totalCount}/>
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
            <div className="relative" style={{ border: "1px solid #0e1a2b", background: "#fbf8f1", padding: 4, height: 1100 }}>
              <div className="absolute" style={{ inset: 4 }}>
                <NorwayMap selectedId={selectedId} onSelect={setSelectedId}/>
              </div>
              <MapLegendOverlay/>
              <MapTotalsOverlay items={items}/>
            </div>
          </div>

          {/* RIGHT: detail + side tables */}
          <div className="flex flex-col gap-6">
            <DetailCard id={selectedId ?? hoverId}/>
            <StatusTable items={items}/>
            <OwnershipBars items={items}/>
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
        <span>Kilder: Nkom · NVE · Statnett · SSB · BRREG · Kartverket</span>
        <span>Sist verifisert 25.04.2026</span>
      </div>
    </div>
  );
}
