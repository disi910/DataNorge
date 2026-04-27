import { useEffect, useMemo, useState } from "react";
import { fetchDataCenters, type DataCenterProps } from "../api";

type Props = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onHover?: (id: string | null) => void;
  onItemsLoaded?: (items: DataCenterProps[]) => void;
};

type FilterKey = "all" | "oper" | "plan";
type SortKey = "mw" | "plan" | "name";

const FILTERS: { k: FilterKey; l: string }[] = [
  { k: "all", l: "alle" },
  { k: "oper", l: "i drift" },
  { k: "plan", l: "planlagt" },
];

const SORTS: { k: SortKey; l: string }[] = [
  { k: "mw", l: "effekt" },
  { k: "plan", l: "plan" },
  { k: "name", l: "navn" },
];

const MAX_MW = 150;

export function DataCenterList({ selectedId, onSelect, onHover, onItemsLoaded }: Props) {
  const [items, setItems] = useState<DataCenterProps[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("mw");

  useEffect(() => {
    fetchDataCenters()
      .then((fc) => {
        const list = fc.features.map((f) => f.properties);
        setItems(list);
        onItemsLoaded?.(list);
      })
      .catch((e) => setError(String(e)));
  }, [onItemsLoaded]);

  const filtered = useMemo(() => {
    if (!items) return [];
    let arr = items.slice();
    if (filter === "oper") arr = arr.filter((s) => s.status === "operational");
    else if (filter === "plan") arr = arr.filter((s) => s.status !== "operational");
    if (q) {
      const Q = q.toLowerCase();
      arr = arr.filter((s) =>
        ((s.name ?? "") + " " + (s.kommune_name ?? "") + " " + (s.owner ?? "") + " " + (s.operator ?? ""))
          .toLowerCase()
          .includes(Q),
      );
    }
    if (sort === "mw") arr.sort((a, b) => (b.mw_current ?? 0) - (a.mw_current ?? 0));
    else if (sort === "plan") arr.sort((a, b) => (b.mw_planned_max ?? 0) - (a.mw_planned_max ?? 0));
    else if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [items, filter, q, sort]);

  if (error) return <div className="p-4 h-mono text-xs text-red-700">Feil: {error}</div>;
  if (!items) return <div className="p-4 h-mono text-xs uppercase tracking-widest text-muted">Laster…</div>;

  return (
    <div>
      <div className="h-mono uppercase border-b border-ink mb-1.5 pb-1.5" style={{ fontSize: 10, letterSpacing: "0.22em" }}>
        Tabell I — Anlegg, sortert ↓
      </div>

      <div className="flex flex-col gap-2.5 py-2.5 border-t border-ink" style={{ borderBottom: "1px solid rgba(14,26,43,0.2)" }}>
        <div className="relative">
          <span className="absolute left-0.5 top-2 h-mono text-muted-2" style={{ fontSize: 12 }}>⌕</span>
          <input
            className="searchbar h-mono"
            placeholder="SØK ETTER NAVN, KOMMUNE, EIER…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="h-mono text-muted mr-1" style={{ fontSize: 9.5, letterSpacing: "0.16em" }}>VIS:</span>
          {FILTERS.map((t) => (
            <button key={t.k} className={`filter-tab ${filter === t.k ? "on" : ""}`} onClick={() => setFilter(t.k)}>
              {t.l}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-1.5 items-center">
            <span className="h-mono text-muted" style={{ fontSize: 9.5, letterSpacing: "0.16em" }}>SORTER:</span>
            {SORTS.map((t) => (
              <button
                key={t.k}
                className={`filter-tab ${sort === t.k ? "on" : ""}`}
                onClick={() => setSort(t.k)}
                style={{ padding: "3px 8px" }}
              >
                {t.l}
              </button>
            ))}
          </div>
          <span className="h-mono text-muted" style={{ fontSize: 10, letterSpacing: "0.14em" }}>
            {filtered.length}/{items.length} entries
          </span>
        </div>
      </div>

      <div className="mt-1" style={{ maxHeight: 1000, overflowY: "auto" }}>
        {filtered.map((s, i) => (
          <SiteRow
            key={s.id}
            s={s}
            rank={String(i + 1).padStart(2, "0")}
            max={MAX_MW}
            selected={selectedId === s.id}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </div>
    </div>
  );
}

function SiteRow({
  s, rank, max, selected, onSelect, onHover,
}: {
  s: DataCenterProps;
  rank: string;
  max: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}) {
  const mw = s.mw_current ?? null;
  const planned = s.mw_planned_max ?? 0;
  const isPlanned = mw == null && planned > 0;
  const barW = mw != null ? (mw / max) * 100 : (planned / max) * 100;
  const barColor = mw != null ? "#1d49c7" : "#0e1a2b";

  return (
    <div
      className={`entry-row grid items-baseline px-2 py-2.5 ${selected ? "selected" : ""}`}
      style={{ gridTemplateColumns: "30px 1fr 110px 92px", gap: 12, borderBottom: "1px solid rgba(14,26,43,0.15)" }}
      onMouseEnter={() => onHover?.(s.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onSelect(s.id)}
    >
      <div className="h-mono nums text-muted-2" style={{ fontSize: 11, paddingTop: 4 }}>{rank}</div>

      <div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="h-serif entry-name" style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.005em" }}>
            {s.name}
          </span>
          {s.kommune_name && (
            <span className="h-serif italic text-muted" style={{ fontSize: 12 }}>
              {s.kommune_name}
            </span>
          )}
        </div>
        <div className="h-mono text-muted" style={{ fontSize: 9.5, marginTop: 3, letterSpacing: "0.06em" }}>
          {(s.kommune_name ?? "—").toUpperCase()}
          {s.operator && <> · {s.operator}</>}
          {s.owner && (
            <>
              {" · "}eier: <span className="text-ink">{s.owner}</span>
            </>
          )}
          {s.owner_country && <> · flagg: {s.owner_country}</>}
        </div>
      </div>

      <div className="relative" style={{ height: 22 }}>
        <div className="absolute left-0 right-0" style={{ bottom: 4, borderBottom: "1px dotted rgba(14,26,43,0.4)" }}/>
        {!isPlanned ? (
          <div
            className="entry-bar absolute"
            style={{ left: 0, bottom: 4, height: 11, width: `${Math.min(barW, 100)}%`, background: barColor }}
          />
        ) : (
          <div
            className="absolute"
            style={{
              left: 0, bottom: 4, height: 11,
              width: `${Math.min(barW, 100)}%`,
              border: "1px dashed #1d49c7", opacity: 0.7,
            }}
          />
        )}
        <div className="h-mono absolute text-muted-2" style={{ right: 0, bottom: 6, fontSize: 8.5, letterSpacing: "0.1em" }}>
          {Math.round(barW)}%
        </div>
      </div>

      <div className="flex items-baseline justify-end gap-1">
        {mw != null ? (
          <>
            <span className="h-serif nums" style={{ fontSize: 26, fontWeight: 400, color: barColor }}>{mw}</span>
            <span className="h-mono text-muted" style={{ fontSize: 10, letterSpacing: "0.12em" }}>MW</span>
          </>
        ) : planned > 0 ? (
          <>
            <span className="h-serif nums italic text-blue" style={{ fontSize: 22, fontWeight: 400 }}>+{planned}</span>
            <span className="h-mono text-blue" style={{ fontSize: 10, letterSpacing: "0.12em" }}>plan</span>
          </>
        ) : (
          <span className="h-serif nums text-muted-2" style={{ fontSize: 22 }}>—</span>
        )}
      </div>
    </div>
  );
}
