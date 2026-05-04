type Tab = "kart" | "redaksjonelt" | "metode" | "kilder";

type Props = {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  totalCount: number;
};

const TABS: Tab[] = ["kart", "redaksjonelt", "metode", "kilder"];

export function Masthead({ activeTab, setActiveTab, totalCount }: Props) {
  return (
    <div className="flex items-end justify-between border-b-2 border-ink pb-4 mb-4">
      <div>
        <h1 className="h-serif" style={{ fontSize: 56, fontWeight: 400, margin: 0, lineHeight: 0.98, letterSpacing: "-0.015em" }}>
          Norges <span className="italic text-blue">{totalCount}</span> datasentre
        </h1>
        <p className="h-sans text-muted" style={{ fontSize: 13.5, marginTop: 12, maxWidth: 640, lineHeight: 1.5 }}>
          Hvem eier dem, hvor mye strøm de bruker, og hva som er reservert i nettkøen.
        </p>
      </div>
      <div className="flex">
        {TABS.map((t) => (
          <button key={t} className={`navbtn ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { Tab };
