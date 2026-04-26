import { useEffect, useState } from "react";
import { fetchDataCenters, type DataCenterProps } from "../api";

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function DataCenterList({ selectedId, onSelect }: Props) {
  const [items, setItems] = useState<DataCenterProps[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDataCenters()
      .then((fc) => setItems(fc.features.map((f) => f.properties)))
      .catch((e) => setError(String(e)));
  }, []);

  if (error) {
    return <div className="p-6 font-mono text-xs text-red-600">Feil: {error}</div>;
  }
  if (!items) {
    return (
      <div className="p-6 font-mono text-xs uppercase tracking-widest text-ink/50">
        Laster datasentre…
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="p-6 font-mono text-xs text-ink/60">
        <div className="uppercase tracking-widest">0 datasentre</div>
      </div>
    );
  }

  const effectiveMw = (dc: DataCenterProps) => dc.mw_current ?? dc.mw_planned_max ?? 0;
  const sorted = [...items].sort((a, b) => effectiveMw(b) - effectiveMw(a));

  return (
    <div>
      <div className="border-b border-ink/10 bg-paper/80 px-6 py-4">
        <div className="font-mono text-xs uppercase tracking-widest text-ink/50">
          {items.length} datasentre
        </div>
        <p className="mt-1 text-xs text-ink/60">
          Sortert etter effekt (MW). Klikk en linje for detaljer.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_auto] items-baseline gap-3 border-b border-ink/10 bg-paper px-6 py-2 font-mono text-[10px] uppercase tracking-widest text-ink/50">
        <span>Navn · Lokasjon · Eier</span>
        <span className="text-right" title="Megawatt elektrisk effekt — strømtrekk ved full belastning">Effekt (MW)</span>
      </div>

      <div className="divide-y divide-ink/10">
        {sorted.map((dc) => {
          const isSelected = dc.id === selectedId;
          const isForeign = dc.owner_country && dc.owner_country !== "NO";
          const mw = dc.mw_current ?? dc.mw_planned_max;
          const isPlanned = dc.mw_current == null && dc.mw_planned_max != null;
          return (
            <button
              key={dc.id}
              onClick={() => onSelect(dc.id)}
              className={`grid w-full grid-cols-[1fr_auto] items-baseline gap-3 px-6 py-4 text-left transition ${
                isSelected ? "bg-accent/10" : "hover:bg-ink/5"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{dc.name}</span>
                  {dc.status === "under_construction" && (
                    <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-amber-900">
                      Bygges
                    </span>
                  )}
                  {dc.status === "planned" && (
                    <span className="shrink-0 rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-ink/60">
                      Planlagt
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-ink/60">
                  <span className="truncate">
                    {dc.kommune_name ?? "Ukjent kommune"}
                  </span>
                  {dc.owner && (
                    <>
                      <span className="text-ink/30">·</span>
                      <span className="truncate">{dc.owner}</span>
                    </>
                  )}
                  {isForeign && (
                    <span className="shrink-0 rounded bg-ink px-1.5 py-0.5 font-mono text-[9px] text-white">
                      {dc.owner_country}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right font-mono tabular-nums">
                {mw != null ? (
                  <>
                    <div className="text-lg leading-tight">{mw}</div>
                    {isPlanned && (
                      <div className="text-[9px] uppercase tracking-widest text-ink/40">planlagt</div>
                    )}
                  </>
                ) : (
                  <div className="text-lg leading-tight text-ink/30">—</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
