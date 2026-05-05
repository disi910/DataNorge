import type { DataCenterProps } from "../api";

const COUNTRY_LABELS: Record<string, string> = {
  IL: "Israel",
  LU: "Luxembourg",
  US: "USA",
  NO: "Norge",
  DE: "Tyskland",
  CA: "Canada",
  SG: "Singapore",
  GB: "Storbritannia",
};

export function OwnershipBars({ items }: { items: DataCenterProps[] }) {
  const totals = new Map<string, number>();
  for (const dc of items) {
    if (dc.status !== "operational") continue;
    const c = dc.owner_country ?? "?";
    totals.set(c, (totals.get(c) ?? 0) + (dc.mw_current ?? 0));
  }
  const data = Array.from(totals.entries())
    .filter(([, v]) => v > 0)
    .map(([c, v]) => ({ c, label: COUNTRY_LABELS[c] ?? c, v }))
    .sort((a, b) => b.v - a.v);

  if (data.length === 0) {
    return (
      <div className="h-mono text-muted" style={{ padding: 10, border: "1px solid #0e1a2b", background: "#fbf8f1", fontSize: 10 }}>
        Ingen MW i drift registrert ennå.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.v));
  const total = data.reduce((a, d) => a + d.v, 0);
  const norwegian = data.find((d) => d.c === "NO")?.v ?? 0;
  const foreignPct = total > 0 ? Math.round(((total - norwegian) / total) * 100) : 0;

  return (
    <div style={{ border: "1px solid #0e1a2b", background: "#fbf8f1", padding: 10 }}>
      {data.map((d) => (
        <div key={d.c} style={{ padding: "5px 0", borderBottom: "1px solid rgba(14,26,43,0.08)" }}>
          <div className="flex justify-between items-baseline">
            <span className="" style={{ fontSize: 11.5 }}>{d.label}</span>
            <span className="h-serif nums" style={{ fontSize: 13 }}>
              {d.v} <span className="h-mono text-muted" style={{ fontSize: 8.5, letterSpacing: "0.1em" }}>MW</span>
            </span>
          </div>
          <div className="relative" style={{ height: 5, background: "rgba(14,26,43,0.08)", margin: "4px 0" }}>
            <div
              className="absolute inset-0"
              style={{ width: `${(d.v / max) * 100}%`, background: d.c === "NO" ? "#0e1a2b" : "#1d49c7" }}
            />
          </div>
        </div>
      ))}
      <div className="text-blue" style={{ fontSize: 12, marginTop: 8 }}>
        Utenlandsk andel: ~{foreignPct} %
      </div>
    </div>
  );
}

export function StatusTable({ items }: { items: DataCenterProps[] }) {
  const buckets = [
    { k: "operational", l: "I drift" },
    { k: "under_construction", l: "Under bygging" },
    { k: "planned", l: "Planlagt" },
  ] as const;

  const rows = buckets.map((b) => {
    const sub = items.filter((s) => s.status === b.k);
    const mw = sub.reduce((a, s) => a + (s.mw_current ?? 0), 0);
    const plan = sub.reduce((a, s) => a + (s.mw_planned_max ?? 0), 0);
    return { ...b, mw, plan, n: sub.length };
  });
  const maxPlan = Math.max(1, ...rows.map((r) => r.plan));

  return (
    <div style={{ border: "1px solid #0e1a2b", background: "#fbf8f1" }}>
      {rows.map((r) => (
        <div
          key={r.k}
          className="grid items-center"
          style={{
            gridTemplateColumns: "100px 1fr 60px",
            gap: 10, padding: "8px 10px",
            borderBottom: "1px solid rgba(14,26,43,0.12)",
          }}
        >
          <span className="text-blue font-medium" style={{ fontSize: 13 }}>
            {r.l}
          </span>
          <div>
            <div className="h-sans text-muted" style={{ fontSize: 11 }}>{r.n} anlegg</div>
            <div className="relative" style={{ height: 4, background: "rgba(14,26,43,0.08)", marginTop: 4 }}>
              <div className="absolute inset-0" style={{ width: `${(r.plan / maxPlan) * 100}%`, background: "#1d49c7", opacity: 0.7 }}/>
              <div className="absolute inset-0" style={{ width: `${(r.mw / maxPlan) * 100}%`, background: "#0e1a2b" }}/>
            </div>
          </div>
          <div className="text-right">
            <div className="h-serif nums" style={{ fontSize: 14 }}>{r.mw}</div>
            <div className="text-muted" style={{ fontSize: 11 }}>+{r.plan} plan</div>
          </div>
        </div>
      ))}
      <div className="text-muted" style={{ fontSize: 11, padding: "6px 10px", lineHeight: 1.5 }}>
        ━ drift &nbsp;·&nbsp; <span className="text-blue">━ planlagt</span> &nbsp;·&nbsp; tall i MW
      </div>
    </div>
  );
}

export function MapTotalsOverlay({ items }: { items: DataCenterProps[] }) {
  const opMw = items.filter((s) => s.status === "operational").reduce((a, s) => a + (s.mw_current ?? 0), 0);
  const planMw = items
    .filter((s) => s.status !== "operational")
    .reduce((a, s) => a + (s.mw_planned_max ?? 0), 0);

  return (
    <div
      className="absolute"
      style={{ right: 14, top: 14, background: "rgba(241,236,225,0.95)", border: "1px solid #0e1a2b", padding: "8px 12px", textAlign: "right", minWidth: 180, zIndex: 5 }}
    >
      <div className="text-muted" style={{ fontSize: 11 }}>Navngitte i drift</div>
      <div className="nums" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1 }}>
        {opMw} <span className="text-blue" style={{ fontSize: 13 }}>MW</span>
      </div>
      <div style={{ height: 1, background: "rgba(14,26,43,0.18)", margin: "6px 0" }}/>
      <div className="text-muted" style={{ fontSize: 11 }}>Annonsert pipeline</div>
      <div className="nums text-blue" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1 }}>
        +{planMw} <span style={{ fontSize: 13 }}>MW</span>
      </div>
    </div>
  );
}

export function MapLegendOverlay() {
  return (
    <div
      className="absolute"
      style={{ left: 14, bottom: 14, background: "rgba(251,250,247,0.95)", border: "1px solid #15171a", padding: "8px 10px", zIndex: 5 }}
    >
      <div style={{ fontSize: 12, marginBottom: 6 }}>Tegnforklaring</div>
      <div className="grid items-center" style={{ gridTemplateColumns: "max-content max-content", gap: "4px 10px" }}>
        <span>
          <svg width="22" height="14"><circle cx="11" cy="7" r="6" fill="#15171a" fillOpacity="0.85" stroke="#15171a" strokeWidth="1"/></svg>
        </span>
        <span style={{ fontSize: 10.5 }}>I drift · areal = MW</span>
        <span>
          <svg width="22" height="14"><circle cx="11" cy="7" r="6" fill="#6c6f76" fillOpacity="0.85" stroke="#15171a" strokeWidth="1"/></svg>
        </span>
        <span style={{ fontSize: 10.5 }}>Under bygging</span>
        <span>
          <svg width="22" height="14"><circle cx="11" cy="7" r="6" fill="#a4a7ad" fillOpacity="0.85" stroke="#15171a" strokeWidth="1"/></svg>
        </span>
        <span style={{ fontSize: 10.5 }}>Planlagt</span>
      </div>
    </div>
  );
}
