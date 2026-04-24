import { NorwayMap } from "./components/NorwayMap";
import { DataCenterList } from "./components/DataCenterList";

export default function App() {
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

      <main className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(360px,40%)_1fr]">
        <section className="overflow-y-auto border-r border-ink/10">
          <DataCenterList />
        </section>
        <section className="relative">
          <NorwayMap />
        </section>
      </main>
    </div>
  );
}
