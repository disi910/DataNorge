const PLACEHOLDER = [
  { name: "Green Mountain DC1-Stavanger", kommune: "Rennesøy", mw: 35, owner: "NO" },
  { name: "Green Mountain OSL1-Oslo", kommune: "Enebakk", mw: 22, owner: "NO" },
  { name: "Green Mountain Hamar (TikTok)", kommune: "Hamar", mw: 150, owner: "CN" },
  { name: "Bulk N01 Støleheia", kommune: "Vennesla", mw: 42, owner: "NO" },
  { name: "Microsoft West Norway", kommune: "Stavanger", mw: 80, owner: "US" },
  { name: "Google Skien", kommune: "Skien", mw: 240, owner: "US" },
];

export function DataCenterList() {
  return (
    <div className="divide-y divide-ink/10">
      <div className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-ink/50">
        {PLACEHOLDER.length} datasentre · placeholder-data
      </div>
      {PLACEHOLDER.map((dc) => (
        <button
          key={dc.name}
          className="flex w-full items-baseline justify-between px-6 py-4 text-left transition hover:bg-ink/5"
        >
          <div>
            <div className="font-medium">{dc.name}</div>
            <div className="font-mono text-xs text-ink/50">
              {dc.kommune} · {dc.owner}
            </div>
          </div>
          <div className="font-mono tabular-nums text-lg">{dc.mw} MW</div>
        </button>
      ))}
    </div>
  );
}
