type Tab = "kart" | "redaksjonelt" | "metode" | "kilder";

type Props = {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  totalCount: number;
  longtailCount: number;
  plannedCount: number;
};

const TABS: Tab[] = ["kart", "redaksjonelt", "metode", "kilder"];

export function Masthead({ activeTab, setActiveTab, totalCount, longtailCount, plannedCount }: Props) {
  return (
    <div className="flex items-end justify-between border-b-2 border-ink pb-4 mb-4">
      <div>
        <div className="h-mono uppercase text-blue" style={{ fontSize: 10.5, letterSpacing: "0.32em" }}>
          <span className="inline-block w-2 h-2 rounded-full bg-blue mr-2 -translate-y-px"/>
          DATASENTER-NORGE · REGISTER 2026/04 · {totalCount - longtailCount} KARTLAGTE + {longtailCount} I HALELANGEN
        </div>
        <h1 className="h-serif" style={{ fontSize: 56, fontWeight: 400, margin: "10px 0 0", lineHeight: 0.98, letterSpacing: "-0.015em" }}>
          Norges <span className="italic text-blue">{totalCount}</span> datasentre - <span className="italic">kartlagt</span>
        </h1>
        <p className="h-sans text-muted" style={{ fontSize: 13.5, marginTop: 12, maxWidth: 720, lineHeight: 1.5 }}>
          Hvem eier dem, hvor mye strøm de bruker, og hva som er reservert i nettkøen.
          Et åpent register sammenstilt fra Nkom, NVE, Statnett, Brønnøysund og publikt offentliggjort selskapsmateriale -
          oppdatert <span className="nums">25.04.2026</span>.
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex">
          {TABS.map((t) => (
            <button key={t} className={`navbtn ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="h-mono text-muted" style={{ fontSize: 10, marginTop: 4, letterSpacing: "0.1em" }}>
          <span className="text-blue">●</span> {totalCount - longtailCount - plannedCount} navngitt i drift&nbsp;&nbsp;
          <span className="text-blue font-semibold">○</span> {plannedCount} planlagte&nbsp;&nbsp;
          <span className="text-muted-2">·</span> {longtailCount} anonyme captive
        </div>
      </div>
    </div>
  );
}

export type { Tab };
