import { useEffect, useState } from "react";
import { fetchDataCenter, type DataCenterDetail as Detail } from "../api";

const SOURCE_TYPE_LABEL: Record<string, string> = {
  press: "Pressedekning",
  press_release: "Pressemelding",
  annual_report: "Årsrapport",
  kommune_plansak: "Kommune-plansak",
  nve_konsesjon: "NVE-konsesjon",
  "official-list": "Offentlig register",
  corporate_website: "Selskapets nettside",
  manual: "Manuell registrering",
};

function fmtMw(n: number | null | undefined): string {
  if (n == null) return "—";
  return Number.isInteger(n) ? `${n}` : n.toFixed(1);
}

export function DetailCard({ id }: { id: string | null }) {
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setError(null);
      return;
    }
    let cancel = false;
    setData(null);
    setError(null);
    fetchDataCenter(id)
      .then((d) => { if (!cancel) setData(d); })
      .catch((e) => { if (!cancel) setError(String(e)); });
    return () => { cancel = true; };
  }, [id]);

  if (!id) {
    return (
      <div
        className="h-mono text-muted"
        style={{ padding: 14, border: "1px dashed rgba(14,26,43,0.3)", fontSize: 11, letterSpacing: "0.08em", lineHeight: 1.5 }}
      >
        ↳ Velg et anlegg i listen eller kartet for å lese detaljer.<br/>
        Hold musen over et punkt på kartet for å forhåndsvise.
      </div>
    );
  }

  if (error) {
    return <div className="p-3 h-mono text-xs text-red-700">Feil: {error}</div>;
  }
  if (!data) {
    return (
      <div className="h-mono uppercase text-muted" style={{ padding: 14, fontSize: 10, letterSpacing: "0.18em" }}>
        Laster…
      </div>
    );
  }

  const s = data;
  const cap = s.latest_capacity;
  const mw = cap?.mw_current ?? null;
  const planned = cap?.mw_planned_max ?? null;
  const isOper = s.status === "operational";
  const utilLow = mw != null ? Math.round(mw * 0.4) : null;
  const utilHigh = mw != null ? Math.round(mw * 0.7) : null;
  const util = mw != null ? `${utilLow}–${utilHigh} MW snitt last (40–70 % utnyttelse)` : "ikke i drift";
  const conf = cap?.confidence ?? 0;

  return (
    <div className="relative" style={{ padding: 14, border: "1px solid #0e1a2b", background: "#fbf8f1" }}>
      <div
        className="h-mono"
        style={{ position: "absolute", top: -1, right: -1, padding: "3px 8px", background: "#0e1a2b", color: "#f1ece1", fontSize: 9, letterSpacing: "0.18em" }}
      >
        ENTRY · {s.id.slice(0, 12).toUpperCase()}
      </div>

      <div className="h-mono text-blue" style={{ fontSize: 9.5, letterSpacing: "0.2em" }}>
        {(s.kommune.name ?? "—").toUpperCase()} · {isOper ? "I DRIFT" : s.status === "under_construction" ? "UNDER BYGGING" : "PLANLAGT"}
      </div>
      <div className="h-serif" style={{ fontSize: 22, fontWeight: 500, marginTop: 4, lineHeight: 1.1 }}>{s.name}</div>
      {s.address && (
        <div className="h-serif italic text-muted" style={{ fontSize: 13, marginTop: 2 }}>{s.address}</div>
      )}

      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(14,26,43,0.18)" }}
      >
        <div>
          <div className="h-mono text-muted" style={{ fontSize: 9, letterSpacing: "0.16em" }}>I DRIFT (MW)</div>
          <div
            className="h-serif nums"
            style={{ fontSize: 30, fontWeight: 400, lineHeight: 1, color: isOper ? "#1d49c7" : "#8a8e98" }}
          >
            {mw != null ? fmtMw(mw) : "—"}
          </div>
        </div>
        <div>
          <div className="h-mono text-muted" style={{ fontSize: 9, letterSpacing: "0.16em" }}>FULLT UTBYGD</div>
          <div className="h-serif nums" style={{ fontSize: 30, fontWeight: 400, lineHeight: 1 }}>
            {planned != null ? fmtMw(planned) : "—"}
          </div>
        </div>
      </div>

      <div
        className="grid"
        style={{
          marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(14,26,43,0.18)",
          gridTemplateColumns: "max-content 1fr", gap: "3px 12px",
        }}
      >
        {s.operator?.name && (
          <>
            <span className="h-mono text-muted" style={{ fontSize: 9.5, letterSpacing: "0.14em" }}>OPERATØR</span>
            <span className="h-sans" style={{ fontSize: 11.5 }}>{s.operator.name}</span>
          </>
        )}
        {s.owner?.name && (
          <>
            <span className="h-mono text-muted" style={{ fontSize: 9.5, letterSpacing: "0.14em" }}>EIER</span>
            <span className="h-sans" style={{ fontSize: 11.5 }}>{s.owner.name}</span>
          </>
        )}
        {(s.owner?.country || s.operator?.country) && (
          <>
            <span className="h-mono text-muted" style={{ fontSize: 9.5, letterSpacing: "0.14em" }}>FLAGG</span>
            <span className="h-sans" style={{ fontSize: 11.5 }}>{s.owner?.country ?? s.operator?.country}</span>
          </>
        )}
        <span className="h-mono text-muted" style={{ fontSize: 9.5, letterSpacing: "0.14em" }}>SNITT-LAST</span>
        <span className="h-sans" style={{ fontSize: 11.5, color: "#2a3a52" }}>{util}</span>

        {cap && (
          <>
            <span className="h-mono text-muted" style={{ fontSize: 9.5, letterSpacing: "0.14em" }}>KONFIDENS</span>
            <span className="h-sans nums" style={{ fontSize: 11.5 }}>
              c · {conf.toFixed(2)}
              <span
                className="inline-block align-middle relative"
                style={{ marginLeft: 8, width: 60, height: 4, background: "rgba(14,26,43,0.12)" }}
              >
                <span className="absolute" style={{ inset: 0, width: `${conf * 100}%`, background: "#1d49c7" }}/>
              </span>
            </span>
          </>
        )}
      </div>

      {s.kommune_share_pct_upper_bound != null && (
        <div
          className="h-serif italic"
          style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(14,26,43,0.18)", fontSize: 12.5, color: "#2a3a52", lineHeight: 1.45 }}
        >
          Ved 100 % bruk ville dette utgjort{" "}
          <span className="nums not-italic font-medium text-blue">
            {s.kommune_share_pct_upper_bound >= 10
              ? s.kommune_share_pct_upper_bound.toFixed(0)
              : s.kommune_share_pct_upper_bound.toFixed(1)} %
          </span>{" "}
          av all elektrisitet i {s.kommune.name ?? "kommunen"}. Reell utnyttelse 40–70 %.
        </div>
      )}

      {s.notes && (
        <div
          className="h-serif italic"
          style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(14,26,43,0.18)", fontSize: 12.5, color: "#2a3a52", lineHeight: 1.45 }}
        >
          {s.notes}
        </div>
      )}

      {s.capacity_history.length > 0 && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(14,26,43,0.18)" }}>
          <div className="h-mono uppercase text-muted" style={{ fontSize: 9, letterSpacing: "0.18em", marginBottom: 6 }}>
            Kilder
          </div>
          <ul className="flex flex-col gap-2">
            {s.capacity_history.slice(0, 4).map((obs, i) => (
              <li key={i} className="text-xs">
                <a
                  href={obs.source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="h-serif italic underline"
                  style={{ color: "#0e1a2b", textDecorationColor: "rgba(14,26,43,0.3)" }}
                >
                  {obs.source.title ?? obs.source.url}
                </a>
                <div className="h-mono text-muted" style={{ fontSize: 9.5, letterSpacing: "0.06em", marginTop: 2 }}>
                  {SOURCE_TYPE_LABEL[obs.source.source_type] ?? obs.source.source_type}
                  {obs.observed_at && <> · {obs.observed_at.slice(0, 10)}</>}
                  {obs.source.domain && <> · {obs.source.domain}</>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="h-mono uppercase text-muted-2" style={{ fontSize: 9, letterSpacing: "0.16em", marginTop: 12 }}>
        Sist verifisert {s.last_verified?.slice(0, 10) ?? "—"}
      </div>
    </div>
  );
}

// Backwards-compatible default-ish export name
export { DetailCard as DataCenterDetail };
