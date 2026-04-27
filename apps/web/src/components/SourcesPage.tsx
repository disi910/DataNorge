const SOURCES = [
  { n: "Nkom", d: "Datasenterregister, oppdatert 20.03.2026 — autoritativ telling: 104 sentre / 55 operatører." },
  { n: "NVE",  d: "Energiteknikk-data 1H 2025 (1,4 TWh, +50 % y/y) og LA25-prognoser (6/8/10/13 TWh)." },
  { n: "Statnett", d: "Reservert ny last + moden kø (Innst. 140S, 2025-2026): 3 363 MW reservert, 4 465 MW i kø." },
  { n: "SSB",   d: "Nettoforbruk av elektrisk kraft, 2024-tall — 2,1 TWh / ~1,5 % av norsk produksjon." },
  { n: "BRREG / Proff", d: "Eierkjeder fra norsk drifts­selskap til ultimat morselskap." },
  { n: "E24",  d: "Mapping høst 2025 — 26 av 49 operatører hadde utenlandsk eier." },
  { n: "Stortinget", d: "Innst. 140S 2025-26 — Statnett-reservasjon, mod. kø, sektorfordeling." },
  { n: "Digitaliserings­dep.", d: "Datasenter-strategi (juni 2025), ministerens svar oktober 2025." },
  { n: "Kartverket", d: "Adressesøk for geokoding; kommune-sentrum hvor adresse ikke er offentlig." },
  { n: "Bedriftspresse", d: "DCD · TU · Digi.no · NRK · Klassekampen — for site-spesifikke MW-tall." },
];

export function SourcesPage() {
  return (
    <div style={{ marginTop: 16, paddingBottom: 40 }}>
      <div className="h-mono uppercase text-blue" style={{ fontSize: 10.5, letterSpacing: "0.3em" }}>Kilder &amp; rettelser</div>
      <h2 className="h-serif" style={{ fontSize: 48, fontWeight: 400, lineHeight: 1, margin: "6px 0 18px" }}>
        Vi siterer alt — og <span className="italic text-blue">retter</span> alt.
      </h2>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "14px 36px", maxWidth: 1100 }}>
        {SOURCES.map((s, i) => (
          <div
            key={i}
            className="grid"
            style={{ gridTemplateColumns: "120px 1fr", gap: 14, paddingBottom: 12, borderBottom: "1px solid rgba(14,26,43,0.18)" }}
          >
            <span className="h-mono uppercase text-blue" style={{ fontSize: 11, letterSpacing: "0.14em" }}>{s.n}</span>
            <span className="h-serif" style={{ fontSize: 13.5, lineHeight: 1.5, color: "#2a3a52" }}>{s.d}</span>
          </div>
        ))}
      </div>
      <div className="h-serif italic text-muted" style={{ fontSize: 14, marginTop: 24, maxWidth: 760, lineHeight: 1.5 }}>
        Ser du en feil? Datasettet er CC BY 4.0 og rettelses­logg ligger åpent. Skriv til redaksjonen — vi oppdaterer registeret månedlig.
      </div>
    </div>
  );
}
