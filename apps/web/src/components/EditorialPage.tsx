export function EditorialPage() {
  return (
    <div style={{ marginTop: 16, paddingBottom: 40 }}>
      <div className="text-blue" style={{ fontSize: 13, fontStyle: "italic" }}>
        Redaksjonelt · nr. 04 · april 2026
      </div>
      <h2 className="h-serif" style={{ fontSize: 78, fontWeight: 400, lineHeight: 0.96, margin: "8px 0 4px", maxWidth: 1100, letterSpacing: "-0.02em" }}>
        Det <span className="italic">du bør vite</span> om<br/>
        datasentrene <span className="blue-underline">i Norge</span>.
      </h2>
      <div className="h-serif italic text-muted" style={{ fontSize: 17, maxWidth: 760, marginTop: 14, lineHeight: 1.5 }}>
        En lesning av 104 sentre, 3 363 reserverte megawatt, og en næring der utenlandsk kapital nå eier mer enn halvparten av kapasiteten.
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "1.1fr 1fr 1fr", gap: 36, marginTop: 28, paddingTop: 20, borderTop: "2px solid #0e1a2b" }}
      >
        <div>
          <div className="text-blue" style={{ fontSize: 13, fontStyle: "italic" }}>Funn 01 — strømmen</div>
          <p className="h-serif" style={{ fontSize: 16, lineHeight: 1.62, margin: "10px 0 0", letterSpacing: "-0.005em" }}>
            <span className="h-serif text-blue" style={{ float: "left", fontSize: 90, lineHeight: 0.82, fontWeight: 500, paddingRight: 10, paddingTop: 6 }}>N</span>
            orge har <span className="nums font-medium">104</span> registrerte datasentre i drift. I 2024 brukte de <span className="nums font-medium">2,1 TWh</span> - omtrent <span className="nums">1,5 %</span> av landets produksjon. Første halvår 2025 lå forbruket allerede på <span className="nums">1,4 TWh</span>, en <span className="nums">50 %</span>-økning fra samme periode året før. Annualisert lander 2025 på i underkant av <span className="nums">3 TWh</span>.
          </p>
          <p className="h-serif" style={{ fontSize: 16, lineHeight: 1.62, marginTop: 14 }}>
            NVE-prognosen for <span className="nums">2030</span> er <span className="nums font-medium text-blue">6 TWh</span> - nær en tredobling fra 2024. Den prognosen var ute før Tydals 180 MW AI-konvertering, før Stargate Narvik, og før Google fikk konsesjon i Skien.
          </p>
          <p className="h-serif italic text-muted" style={{ fontSize: 14, lineHeight: 1.55, marginTop: 14 }}>
            Denne siden tar ikke stilling. Den viser bare hvor lasten lander.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div style={{ borderTop: "3px solid #0e1a2b", borderBottom: "3px solid #0e1a2b", padding: "18px 0" }}>
            <div className="text-blue" style={{ fontSize: 13, fontStyle: "italic" }}>Funn 02 — reservert kapasitet</div>
            <div className="h-serif nums" style={{ fontSize: 92, fontWeight: 400, lineHeight: 0.95, marginTop: 6, letterSpacing: "-0.025em" }}>3 363</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>MW i Statnetts ordrebok, des. 2025</div>
            <div className="h-serif italic" style={{ fontSize: 14, marginTop: 10, color: "#2a3a52", lineHeight: 1.55 }}>
              Datasentre står for <span className="nums font-medium">36 %</span> av all reservert ny last i Norge - mer enn enhver annen sektor. Ved full utbygging tilsvarer det <span className="nums">20–30 TWh/år</span>: omtrent halvparten av all norsk husholdnings­strøm.
            </div>
          </div>
          <div>
            <div className="text-blue" style={{ fontSize: 13, fontStyle: "italic" }}>Funn 03 — mest i øst</div>
            <p className="h-serif" style={{ fontSize: 14.5, lineHeight: 1.55, margin: 0, marginTop: 6 }}>
              Det enkeltstørste anlegget i drift er Green Mountain på Hamar (<span className="nums">90 MW</span>) - TikToks anker. De to neste er Microsoft Azure øst og vest. Norsk-eide aktører driver <span className="italic">mindre, fjellkjølte</span> anlegg, konsentrert langs sør- og vestkysten.
            </p>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontStyle: "italic", marginBottom: 6, paddingBottom: 4, borderBottom: "1px solid #0e1a2b" }}>
            Figur 1 · effekt etter eierland
          </div>
          <svg viewBox="0 0 320 320" width="100%" style={{ display: "block" }}>
            <g fontFamily="Instrument Serif, serif" fontSize="11" fill="#0e1a2b">
              {[
                { label: "Israel · Azrieli/GM", v: 170, no: false },
                { label: "Luxembourg-fond", v: 152, no: false },
                { label: "USA · MS · Apollo · HIG", v: 127, no: false },
                { label: "Norge", v: 51, no: true },
                { label: "Canada · Bitzero", v: 20, no: false },
                { label: "Tyskland · Polarise/DTCP", v: 13, no: false },
                { label: "Singapore · Bitdeer", v: 3, no: false },
              ].map((d, i) => (
                <g key={i} transform={`translate(0 ${i * 44})`}>
                  <text x="0" y="11">{d.label}</text>
                  <rect x="0" y="18" width={d.v * 1.55} height="14" fill={d.no ? "#0e1a2b" : "#1d49c7"} opacity={d.no ? 1 : 0.85}/>
                  <text x={d.v * 1.55 + 5} y="29" fontSize="12" fontFamily="Instrument Serif, serif">{d.v}</text>
                </g>
              ))}
            </g>
          </svg>
          <div className="h-serif italic" style={{ marginTop: 12, fontSize: 14, color: "#2a3a52", lineHeight: 1.45 }}>
            ↑&nbsp; Andelen <span className="text-blue not-italic font-medium">utenlandsk-eid driftskapasitet</span>: rundt <span className="nums" style={{ fontSize: 22 }}>91 %</span> av navngitt MW.
          </div>
        </div>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 36, marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(14,26,43,0.3)" }}
      >
        <div>
          <div className="text-blue" style={{ fontSize: 13, fontStyle: "italic" }}>Funn 04 — gapet</div>
          <p className="h-serif" style={{ fontSize: 14.5, lineHeight: 1.55, margin: "8px 0 0" }}>
            <span className="font-medium">3 363 MW reservert. ~240 MW snitt-last.</span> Bare <span className="nums text-blue font-medium">~7 %</span> av reservert kapasitet er faktisk i drift. Selv NVEs egen 2030-prognose (~700 MW snitt) ligger langt under det reserverte.
          </p>
        </div>
        <div>
          <div className="text-blue" style={{ fontSize: 13, fontStyle: "italic" }}>Funn 05 — krypto blir AI</div>
          <p className="h-serif" style={{ fontSize: 14.5, lineHeight: 1.55, margin: "8px 0 0" }}>
            Det tydelige signalet i 2025–26 er konvertering: Tydal/Bitdeer skifter <span className="nums">180 MW</span> bitcoin-mining til Nvidia Vera Rubin-AI innen desember 2026. Krypto-andelen krymper, AI-andelen eksploderer.
          </p>
        </div>
        <div>
          <div className="text-blue" style={{ fontSize: 13, fontStyle: "italic" }}>Funn 06 — pipeline-trykk</div>
          <p className="h-serif" style={{ fontSize: 14.5, lineHeight: 1.55, margin: "8px 0 0" }}>
            I Statnetts modne kø står det <span className="nums">12 465 MW</span>, hvorav <span className="nums">4 465 MW (35 %)</span> er datasentre. Områdeplan Nord viser <span className="nums">1 400 MW</span> reservert + <span className="nums">700 MW</span> i kø nord for Ofoten.
          </p>
        </div>
      </div>

      <div
        style={{ marginTop: 36, paddingTop: 14, borderTop: "1px solid #0e1a2b" }}
        className="flex justify-between items-end"
      >
        <div className="text-muted" style={{ fontSize: 13, fontStyle: "italic" }}>
          Fortsetter · funn 07 → kommune-konsentrasjon
        </div>
        <div className="flex gap-2">
          <span className="chip">siter denne siden</span>
          <span className="chip outline-blue">data: cc by 4.0</span>
          <span className="chip blue">les del 2 →</span>
        </div>
      </div>
    </div>
  );
}
