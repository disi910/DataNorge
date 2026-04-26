import { useState } from "react";
import { NorwayMap } from "./components/NorwayMap";
import { DataCenterList } from "./components/DataCenterList";
import { DataCenterDetail } from "./components/DataCenterDetail";

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex h-full w-full flex-col">
      <header className="flex items-baseline justify-between border-b border-ink/10 px-6 py-4">
        <div>
          <h1 className="font-mono text-sm uppercase tracking-[0.2em] text-ink/60">
            Datasenter-Norge
          </h1>
          <p className="mt-1 text-2xl font-medium">
            Hvor går strømmen i Norge?
          </p>
        </div>
        <nav className="flex gap-6 font-mono text-xs uppercase tracking-widest text-ink/60">
          <a href="#radar" className="hover:text-ink">Radar</a>
          <a href="#methodology" className="hover:text-ink">Metode</a>
        </nav>
      </header>

      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="overflow-y-auto border-b border-ink/10 lg:w-[40%] lg:min-w-[360px] lg:border-b-0 lg:border-r">
          <DataCenterList selectedId={selectedId} onSelect={setSelectedId} />
        </section>
        <section className="relative flex-1" style={{ minHeight: 400 }}>
          <NorwayMap selectedId={selectedId} onSelect={setSelectedId} />
          {selectedId && (
            <DataCenterDetail id={selectedId} onClose={() => setSelectedId(null)} />
          )}
        </section>
      </main>
    </div>
  );
}
