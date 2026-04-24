import { useEffect, useState } from "react";
import { fetchDataCenters, type DataCenterProps } from "../api";

export function DataCenterList() {
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
      <div className="space-y-2 p-6 font-mono text-xs text-ink/60">
        <div className="uppercase tracking-widest">0 datasentre</div>
        <p className="font-sans text-sm leading-relaxed text-ink/80">
          Databasen er tom. Kjør seed-skriptene for å fylle inn data:
        </p>
        <pre className="mt-2 whitespace-pre-wrap rounded bg-ink/5 p-3 text-[11px]">
{`docker exec datasenter-api pipeline scrape-nkom
docker exec datasenter-api pipeline seed-top20`}
        </pre>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => (b.mw_current ?? 0) - (a.mw_current ?? 0));

  return (
    <div className="divide-y divide-ink/10">
      <div className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-ink/50">
        {items.length} datasentre
      </div>
      {sorted.map((dc) => (
        <button
          key={dc.id}
          className="flex w-full items-baseline justify-between px-6 py-4 text-left transition hover:bg-ink/5"
        >
          <div className="min-w-0">
            <div className="truncate font-medium">{dc.name}</div>
            <div className="truncate font-mono text-xs text-ink/50">
              {dc.kommune_name ?? "—"}
              {dc.owner_country && dc.owner_country !== "NO" ? ` · ${dc.owner_country}` : ""}
            </div>
          </div>
          <div className="ml-3 font-mono tabular-nums text-lg">
            {dc.mw_current != null ? `${dc.mw_current} MW` : "— MW"}
          </div>
        </button>
      ))}
    </div>
  );
}
