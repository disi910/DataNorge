export function MethodPage() {
  return (
    <div className="grid" style={{ marginTop: 16, gridTemplateColumns: "1fr 1fr", gap: 36, paddingBottom: 40 }}>
      <div>
        <div className="h-mono uppercase text-blue" style={{ fontSize: 10.5, letterSpacing: "0.3em" }}>Metode</div>
        <h2 className="h-serif" style={{ fontSize: 48, fontWeight: 400, lineHeight: 1, margin: "6px 0 14px" }}>
          Hvordan vi <span className="italic text-blue">regner</span>.
        </h2>
        <p className="h-serif" style={{ fontSize: 15, lineHeight: 1.6 }}>
          Hver MW-verdi har en <span className="font-medium">konfidens­score (0,0–1,0)</span>. Tallene aggregeres ikke uten kilde. For kommune­andelen viser vi en <span className="font-medium">båndindikator</span> for 40–70 % utnyttelse - det er den realistiske driftsandelen, ikke 100 %.
        </p>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "max-content 1fr", gap: "6px 14px", marginTop: 16,
            padding: 12, border: "1px solid #0e1a2b", background: "#fbf8f1",
          }}
        >
          {([
            ["0,9–1,0", "Statnett-reservasjon · NVE-konsesjon · revidert årsrapport"],
            ["0,7–0,9", "Børsmelding · selskapets egen pressemelding"],
            ["0,5–0,7", "Bransjepresse: E24 · Digi · TU · DCD · NRK"],
            ["0,3–0,5", "Estimert fra tomt, transformator­størrelse"],
            ["< 0,3",   "Kun grovt bånd; ikke brukt i totaler"],
          ] as const).map(([k, v], i) => (
            <div key={i} style={{ display: "contents" }}>
              <span className="h-mono nums text-blue" style={{ fontSize: 11 }}>{k}</span>
              <span className="h-sans" style={{ fontSize: 12.5, color: "#2a3a52" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="h-mono uppercase text-blue" style={{ fontSize: 10.5, letterSpacing: "0.3em" }}>Forbruk over tid</div>
        <h3 className="h-serif italic" style={{ fontSize: 24, fontWeight: 400, margin: "6px 0 10px" }}>
          Fra 0,7 til 6 TWh på åtte år.
        </h3>
        <Trajectory/>
      </div>
    </div>
  );
}

function Trajectory() {
  const data = [
    { y: 2022, v: 0.7, actual: true },
    { y: 2023, v: 1.6, actual: true },
    { y: 2024, v: 2.1, actual: true },
    { y: 2025, v: 3.0, actual: true },
    { y: 2026, v: 3.8, actual: false },
    { y: 2030, v: 6.0, actual: false },
    { y: 2035, v: 8.0, actual: false },
    { y: 2040, v: 10.0, actual: false },
    { y: 2050, v: 13.0, actual: false },
  ];
  const W = 460, H = 240, padL = 40, padR = 20, padT = 20, padB = 30;
  const xMin = 2022, xMax = 2050;
  const yMax = 14;
  const sx = (y: number) => padL + ((y - xMin) / (xMax - xMin)) * (W - padL - padR);
  const sy = (v: number) => padT + (1 - v / yMax) * (H - padT - padB);
  const actuals = data.filter((d) => d.actual);
  const projected = data.filter((_, i) => i >= actuals.length - 1);
  const path = (arr: typeof data) => arr.map((d, i) => (i === 0 ? "M" : "L") + sx(d.y) + " " + sy(d.v)).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", border: "1px solid #0e1a2b", background: "#fbf8f1" }}>
      {[0, 2, 4, 6, 8, 10, 12, 14].map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke="#0e1a2b" strokeWidth="0.3" opacity="0.18"/>
          <text x={padL - 6} y={sy(v) + 3} fontSize="8" textAnchor="end" fontFamily="JetBrains Mono, monospace" fill="#5b6478">{v}</text>
        </g>
      ))}
      {[2022, 2025, 2030, 2035, 2040, 2050].map((y) => (
        <g key={y}>
          <line x1={sx(y)} x2={sx(y)} y1={padT} y2={H - padB} stroke="#0e1a2b" strokeWidth="0.3" opacity="0.15"/>
          <text x={sx(y)} y={H - padB + 13} fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fill="#5b6478">{y}</text>
        </g>
      ))}
      <text x={6} y={padT - 4} fontSize="8" fontFamily="JetBrains Mono, monospace" fill="#1d49c7" letterSpacing="0.1em">TWh/ÅR</text>
      <path d={path(projected)} fill="none" stroke="#1d49c7" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7"/>
      <path d={path(actuals)} fill="none" stroke="#0e1a2b" strokeWidth="2"/>
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={sx(d.y)} cy={sy(d.v)} r={d.actual ? 3.5 : 3} fill={d.actual ? "#0e1a2b" : "#1d49c7"} stroke="#f1ece1" strokeWidth="1.4"/>
          {(d.y === 2024 || d.y === 2030 || d.y === 2050) && (
            <text x={sx(d.y)} y={sy(d.v) - 9} fontSize="9" textAnchor="middle" fontFamily="Fraunces" fontStyle="italic" fill="#0e1a2b">{d.v} TWh</text>
          )}
        </g>
      ))}
      <line x1={sx(2025)} x2={sx(2025)} y1={sy(13)} y2={sy(0)} stroke="#1d49c7" strokeWidth="0.4" strokeDasharray="2 3"/>
      <text x={sx(2025) + 4} y={sy(13) + 8} fontSize="8" fontFamily="JetBrains Mono, monospace" fill="#1d49c7" letterSpacing="0.08em">FAKTISK / PROGNOSE</text>
    </svg>
  );
}
