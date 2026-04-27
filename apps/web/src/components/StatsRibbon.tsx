const STATS = [
  { k: "104",   u: "sentre i drift",      foot: "Nkom-register, 20.03.2026" },
  { k: "3 363", u: "MW reservert",        foot: "Statnett, des. 2025 — 36 % av all reservert last" },
  { k: "2,1",   u: "TWh forbruk 2024",    foot: "SSB · ≈ 1,5 % av norsk produksjon" },
  { k: "~3,0",  u: "TWh estimat 2025",    foot: "NVE 1H-faktisk × 2 (1,4 TWh i H1)" },
  { k: "6",     u: "TWh prognose 2030",   foot: "NVE LA25 — nær tredobling fra 2024" },
  { k: ">50 %", u: "utenlandsk eierskap", foot: "E24-mapping, høst 2025 (26 av 49)" },
];

export function StatsRibbon() {
  return (
    <div className="grid grid-cols-6 border-t border-b border-ink mb-4">
      {STATS.map((s, i) => (
        <div
          key={i}
          className="px-3.5 py-3"
          style={{ borderRight: i < STATS.length - 1 ? "1px solid rgba(14,26,43,0.18)" : "none" }}
        >
          <div className="h-serif nums" style={{ fontSize: 32, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.01em" }}>
            {s.k}
          </div>
          <div className="h-mono uppercase text-blue" style={{ fontSize: 9.5, letterSpacing: "0.18em", marginTop: 5 }}>
            {s.u}
          </div>
          <div className="h-sans text-muted" style={{ fontSize: 10.5, marginTop: 4, lineHeight: 1.35 }}>
            {s.foot}
          </div>
        </div>
      ))}
    </div>
  );
}
