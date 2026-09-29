import { useEffect, useMemo, useState } from "react";
import { fetchDataCenters, type DataCenterProps } from "../api";
import { NorwayMap } from "./NorwayMap";

type Filter = "all" | "oper" | "plan" | "hyper" | "ai" | "colo" | "krypto";
type Sort = "mw" | "name" | "region";

type Row = DataCenterProps & {
  region: string;
  kind: "hyper" | "ai" | "colo" | "krypto" | null;
  ownerShort: string;
  subtitle: string | null;
  lng: number;
  lat: number;
};

const FILTERS: { k: Filter; l: string }[] = [
  { k: "all", l: "Alle" },
  { k: "oper", l: "I drift" },
  { k: "plan", l: "Plan" },
  { k: "hyper", l: "Hyper" },
  { k: "ai", l: "AI" },
  { k: "colo", l: "Colo" },
  { k: "krypto", l: "Krypto" },
];

const HYPER_NEEDLES = ["microsoft", "google", "meta", "amazon", "azure", "aws", "alphabet", "bytedance", "tiktok"];
const AI_NEEDLES = ["nscale", "aker", "bitdeer", "polar dra", "polarise", "stargate", "ai factory", "ai hub", "ai data"];
const KRYPTO_NEEDLES = ["bitzero", "bluebite", "exanorth", "btc", "krypto", "crypto", "mining"];

function classify(s: DataCenterProps): Row["kind"] {
  const blob = `${s.name ?? ""} ${s.operator ?? ""} ${s.owner ?? ""}`.toLowerCase();
  if (KRYPTO_NEEDLES.some((n) => blob.includes(n))) return "krypto";
  if (HYPER_NEEDLES.some((n) => blob.includes(n))) return "hyper";
  if (AI_NEEDLES.some((n) => blob.includes(n))) return "ai";
  if (s.status === "operational") return "colo";
  return null;
}

function regionFor(lat: number, lng: number): string {
  if (lat > 64.5) return "NO4";
  if (lat > 62.5) return "NO3";
  if (lat <= 59.2) return "NO2";
  if (lng < 7.0) return "NO5";
  return "NO1";
}

function shortenOwner(o: string | null): string {
  if (!o) return "—";
  return o.replace(/\s*\([^)]*\)\s*/g, "").trim();
}

const STATUS_COLORS = {
  operational: "#2f7d5b",
  under_construction: "#d18b1f",
  planned: "#4a6fa5",
  decommissioned: "#9aa0a8",
} as const;

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INK = "#15171a";
const PAPER = "#fbfaf7";
const PAPER_2 = "#f4f2ec";
const PAPER_3 = "#ffffff";
const MUTED = "#6c6f76";
const MUTED_2 = "#a4a7ad";
const HAIRLINE = "rgba(21,23,26,0.14)";
const HAIRLINE_2 = "rgba(21,23,26,0.08)";
const ACCENT_SOFT = "rgba(21,23,26,0.06)";
const SELECTED = "#f1eee5";

const REG_CSS = `
  .reg-row { transition: background 120ms; cursor: pointer; }
  .reg-row:hover { background: ${ACCENT_SOFT}; }
  .reg-row.sel { background: ${SELECTED}; }
  .reg-row.sel .reg-name { font-weight: 500; }
  .reg-tab {
    padding: 4px 10px;
    background: transparent;
    border: 1px solid ${HAIRLINE};
    color: ${MUTED};
    font: 11px/1 ${FONT};
    cursor: pointer;
    border-radius: 0;
  }
  .reg-tab:hover { color: ${INK}; border-color: ${INK}; }
  .reg-tab.on { background: ${INK}; color: ${PAPER}; border-color: ${INK}; }
  .reg-search {
    width: 100%;
    border: 1px solid ${HAIRLINE};
    background: ${PAPER_3};
    padding: 7px 10px 7px 26px;
    font: 12px/1.2 ${FONT};
    color: ${INK};
    outline: none;
  }
  .reg-search:focus { border-color: ${INK}; }
  .reg-search::placeholder { color: ${MUTED_2}; }
  .reg-scroll { overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(21,23,26,0.18) transparent; }
  .reg-scroll::-webkit-scrollbar { width: 6px; }
  .reg-scroll::-webkit-scrollbar-thumb { background: rgba(21,23,26,0.18); }
  .reg-scroll::-webkit-scrollbar-track { background: transparent; }
  .reg-sort { background: transparent; border: 0; padding: 0; cursor: pointer; font: 11px/1 ${FONT}; }
`;

const ROW_GRID = "22px 1fr 38px 70px 56px";

export default function RegisterApp() {
  const [items, setItems] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("mw");

  useEffect(() => {
    fetchDataCenters()
      .then((fc) => {
        const rows: Row[] = fc.features.map((f) => {
          const p = f.properties;
          const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates as [number, number];
          return {
            ...p,
            lng,
            lat,
            region: regionFor(lat, lng),
            kind: classify(p),
            ownerShort: shortenOwner(p.owner),
            subtitle: p.kommune_name ?? null,
          };
        });
        setItems(rows);
      })
      .catch((e) => setError(String(e)));
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    let arr = items.slice();
    if (filter === "oper") arr = arr.filter((s) => s.status === "operational");
    else if (filter === "plan") arr = arr.filter((s) => s.status !== "operational");
    else if (filter === "hyper" || filter === "ai" || filter === "colo" || filter === "krypto") {
      arr = arr.filter((s) => s.kind === filter);
    }
    if (q) {
      const Q = q.toLowerCase();
      arr = arr.filter((s) =>
        ((s.name ?? "") + " " + (s.kommune_name ?? "") + " " + (s.owner ?? "") + " " + (s.operator ?? ""))
          .toLowerCase()
          .includes(Q),
      );
    }
    if (sort === "mw") {
      const rank = (s: Row) => {
        if (s.status === "operational" && (s.mw_current ?? 0) > 0) return 0;
        if (s.status === "under_construction" && (s.mw_planned_max ?? 0) > 0) return 1;
        if (s.status === "planned" && (s.mw_planned_max ?? 0) > 0) return 2;
        return 3;
      };
      const mwOf = (s: Row) =>
        s.status === "operational" ? (s.mw_current ?? 0) : (s.mw_planned_max ?? 0);
      arr.sort((a, b) => rank(a) - rank(b) || mwOf(b) - mwOf(a));
    } else if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "region")
      arr.sort((a, b) => a.region.localeCompare(b.region) || (b.mw_current ?? 0) - (a.mw_current ?? 0));
    return arr;
  }, [items, filter, q, sort]);

  const focused = items?.find((s) => s.id === (hoverId ?? selectedId)) ?? null;

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "minmax(420px, 460px) 1fr",
        gridTemplateRows: "auto 1fr auto",
        background: PAPER,
        color: INK,
        fontFamily: FONT,
      }}
    >
      <style>{REG_CSS}</style>

      {/* HEADER */}
      <header
        style={{
          gridColumn: "1 / -1",
          padding: "18px 28px 14px",
          borderBottom: `1px solid ${INK}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
        }}
      >
        <h1
          style={{
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 500,
            margin: 0,
            lineHeight: 1,
            letterSpacing: "-0.012em",
          }}
        >
          Register Datasenter Norge
        </h1>
      </header>

      {/* LEFT — list */}
      <aside style={{ borderRight: `1px solid ${INK}`, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* search + filter */}
        <div
          style={{
            padding: "12px 18px 10px",
            borderBottom: `1px solid ${HAIRLINE}`,
            display: "flex",
            flexDirection: "column",
            gap: 9,
          }}
        >
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 9, top: 8, fontSize: 12, color: MUTED_2, pointerEvents: "none" }}>⌕</span>
            <input
              className="reg-search"
              placeholder="Søk navn, kommune, eier…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
            {FILTERS.map((tb) => (
              <button
                key={tb.k}
                className={`reg-tab ${filter === tb.k ? "on" : ""}`}
                onClick={() => setFilter(tb.k)}
              >
                {tb.l}
              </button>
            ))}
          </div>
        </div>

        {/* column header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: ROW_GRID,
            gap: 10,
            padding: "8px 10px",
            borderBottom: `1px solid ${INK}`,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11, color: MUTED }}>№</span>
          <button
            className="reg-sort"
            onClick={() => setSort("name")}
            style={{ textAlign: "left", color: sort === "name" ? INK : MUTED }}
          >
            Anlegg / eier
          </button>
          <button
            className="reg-sort"
            onClick={() => setSort("region")}
            style={{ textAlign: "center", color: sort === "region" ? INK : MUTED }}
          >
            Reg.
          </button>
          <span style={{ fontSize: 11, color: MUTED, textAlign: "center" }}>Kapasitet →</span>
          <button
            className="reg-sort"
            onClick={() => setSort("mw")}
            style={{ textAlign: "right", color: sort === "mw" ? INK : MUTED }}
          >
            MW ↓
          </button>
        </div>

        {/* list */}
        <div className="reg-scroll" style={{ flex: "1 1 auto", minHeight: 0 }}>
          {error ? (
            <div style={{ padding: 16, fontSize: 12, color: "#a83333" }}>Feil: {error}</div>
          ) : !items ? (
            <div style={{ padding: 16, fontSize: 12, color: MUTED }}>Laster…</div>
          ) : (
            filtered.map((s, i) => (
              <SiteRow
                key={s.id}
                s={s}
                rank={String(i + 1).padStart(2, "0")}
                selected={selectedId === s.id}
                onSelect={setSelectedId}
                onHover={setHoverId}
              />
            ))
          )}
        </div>

        {/* list footer */}
        <div
          style={{
            padding: "8px 12px",
            borderTop: `1px solid ${HAIRLINE}`,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: MUTED,
          }}
        >
          <span>
            {filtered.length}/{items?.length ?? 0} oppføringer
          </span>
          <span>+ 73 anonyme captive (ikke listet)</span>
        </div>
      </aside>

      {/* RIGHT — map */}
      <main style={{ position: "relative", display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* map header */}
        <div
          style={{
            padding: "10px 24px",
            borderBottom: `1px solid ${HAIRLINE}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, color: MUTED }}>Geografisk fordeling</span>
          <span style={{ fontSize: 11, color: MUTED, display: "inline-flex", alignItems: "center", gap: 14 }}>
            <span style={{ color: STATUS_COLORS.operational }}>I drift</span>
            <span style={{ color: STATUS_COLORS.under_construction }}>Under bygging</span>
            <span style={{ color: STATUS_COLORS.planned }}>Planlagt</span>
          </span>
        </div>

        {/* map container */}
        <div style={{ flex: "1 1 auto", minHeight: 0, position: "relative", background: PAPER_2 }}>
          <NorwayMap selectedId={selectedId} onSelect={setSelectedId} />

          {focused && (
            <div
              style={{
                position: "absolute",
                left: 28,
                bottom: 22,
                width: 280,
                background: PAPER_3,
                border: `1px solid ${INK}`,
                padding: "10px 12px 11px",
                boxShadow: `2px 2px 0 ${INK}`,
                pointerEvents: "auto",
                zIndex: 10,
              }}
            >
              <button
                onClick={() => {
                  setSelectedId(null);
                  setHoverId(null);
                }}
                aria-label="Lukk"
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 20,
                  height: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: 0,
                  padding: 0,
                  color: MUTED,
                  fontSize: 14,
                  lineHeight: 1,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = INK)}
                onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
              >
                ✕
              </button>
              <div style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.15, paddingRight: 22 }}>
                {focused.name}
              </div>
              {focused.subtitle && (
                <div style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>{focused.subtitle}</div>
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginTop: 8,
                  paddingTop: 7,
                  borderTop: `1px solid ${HAIRLINE}`,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, color: MUTED }}>I drift</div>
                  <div className="nums" style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.1 }}>
                    {focused.mw_current ?? "—"}
                    <span style={{ fontSize: 10, color: MUTED, marginLeft: 3, fontWeight: 400 }}>MW</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: MUTED }}>Fullt utbygd</div>
                  <div className="nums" style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.1 }}>
                    {focused.mw_planned_max ?? "—"}
                    <span style={{ fontSize: 10, color: MUTED, marginLeft: 3, fontWeight: 400 }}>MW</span>
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 8,
                  paddingTop: 7,
                  borderTop: `1px solid ${HAIRLINE}`,
                  display: "grid",
                  gridTemplateColumns: "max-content 1fr",
                  gap: "3px 10px",
                }}
              >
                <span style={{ fontSize: 11, color: MUTED }}>Oper.</span>
                <span style={{ fontSize: 11 }}>{focused.operator ?? "—"}</span>
                <span style={{ fontSize: 11, color: MUTED }}>Eier</span>
                <span style={{ fontSize: 11 }}>{focused.owner ?? "—"}</span>
                <span style={{ fontSize: 11, color: MUTED }}>Flagg</span>
                <span style={{ fontSize: 11 }}>
                  {focused.owner_country ? (
                    <img
                      src={`https://flagsapi.com/${focused.owner_country}/flat/64.png`}
                      alt={focused.owner_country}
                      width={20}
                      height={15}
                      style={{ display: "inline-block", verticalAlign: "middle" }}
                    />
                  ) : (
                    "—"
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          gridColumn: "1 / -1",
          padding: "8px 28px",
          borderTop: `1px solid ${INK}`,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: MUTED,
        }}
      >
        <span>Datasenter-Norge, åpen data CC BY 4.0</span>
        <span>Kilder: Nkom, NVE, Statnett, SSB, BRREG, Kartverket</span>
        <span>Register 2026/04</span>
      </footer>
    </div>
  );
}

function SiteRow({
  s,
  rank,
  selected,
  onSelect,
  onHover,
}: {
  s: Row;
  rank: string;
  selected: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const cur = s.mw_current ?? 0;
  const planned = s.mw_planned_max ?? 0;
  const utilized = planned > 0 ? Math.min(100, (cur / planned) * 100) : 0;
  const planOnly = cur === 0 && planned > 0;
  const hasAny = cur > 0 || planned > 0;
  const mw = s.mw_current ?? null;

  return (
    <div
      className={`reg-row ${selected ? "sel" : ""}`}
      onMouseEnter={() => onHover(s.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(s.id)}
      style={{
        display: "grid",
        gridTemplateColumns: ROW_GRID,
        gap: 10,
        alignItems: "center",
        padding: "6px 10px",
        borderBottom: `1px solid ${HAIRLINE_2}`,
      }}
    >
      <div className="nums" style={{ fontSize: 11, color: MUTED_2 }}>
        {rank}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          className="reg-name"
          style={{
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {s.name}
        </div>
        <div
          style={{
            fontSize: 11,
            marginTop: 1,
            color: MUTED,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {s.kommune_name ?? "—"}, {s.ownerShort}
        </div>
      </div>
      <div style={{ fontSize: 11, color: MUTED, textAlign: "center" }}>{s.region}</div>
      <div style={{ position: "relative", height: 8 }}>
        {hasAny && (
          <div style={{ position: "absolute", left: 0, top: 3, right: 0, height: 1, background: HAIRLINE }} />
        )}
        {planOnly ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: 7,
              width: "100%",
              border: `1px dashed ${STATUS_COLORS.planned}`,
              opacity: 0.55,
            }}
          />
        ) : (
          utilized > 0 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: 7,
                width: `${utilized}%`,
                background: STATUS_COLORS.operational,
                opacity: 0.9,
              }}
            />
          )
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 3 }}>
        {mw != null ? (
          <>
            <span className="nums" style={{ fontSize: 16, fontWeight: 600 }}>
              {mw}
            </span>
            <span style={{ fontSize: 10, color: MUTED }}>MW</span>
          </>
        ) : planned > 0 ? (
          <>
            <span className="nums" style={{ fontSize: 14, fontWeight: 500, color: MUTED }}>
              +{planned}
            </span>
            <span style={{ fontSize: 10, color: MUTED }}>p</span>
          </>
        ) : (
          <span className="nums" style={{ fontSize: 14, color: MUTED_2 }}>
            —
          </span>
        )}
      </div>
    </div>
  );
}
