import { useEffect, useState } from "react";
import { fetchDataCenter, type DataCenterDetail as Detail } from "../api";

const STATUS_LABEL: Record<Detail["status"], string> = {
  operational: "I drift",
  under_construction: "Under bygging",
  planned: "Planlagt",
  decommissioned: "Avviklet",
};

const STATUS_COLOR: Record<Detail["status"], string> = {
  operational: "bg-teal-600 text-white",
  under_construction: "bg-amber-500 text-ink",
  planned: "bg-ink/40 text-white",
  decommissioned: "bg-ink/30 text-white",
};

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

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.7 ? "bg-teal-600" : value >= 0.5 ? "bg-amber-500" : "bg-ink/40";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink/10">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs text-ink/60">{pct}%</span>
    </div>
  );
}

export function DataCenterDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    setData(null);
    setError(null);
    fetchDataCenter(id)
      .then((d) => { if (!cancel) setData(d); })
      .catch((e) => { if (!cancel) setError(String(e)); });
    return () => { cancel = true; };
  }, [id]);

  return (
    <aside className="absolute right-0 top-0 z-10 flex h-full w-full max-w-[480px] flex-col overflow-y-auto border-l border-ink/10 bg-paper shadow-2xl">
      <div className="sticky top-0 flex items-center justify-between border-b border-ink/10 bg-paper/95 px-6 py-4 backdrop-blur">
        <span className="font-mono text-xs uppercase tracking-widest text-ink/50">Datasenter</span>
        <button
          onClick={onClose}
          className="rounded p-1 text-ink/60 transition hover:bg-ink/5 hover:text-ink"
          aria-label="Lukk"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {error && <div className="p-6 font-mono text-xs text-red-600">Feil: {error}</div>}
      {!data && !error && (
        <div className="p-6 font-mono text-xs uppercase tracking-widest text-ink/50">Laster…</div>
      )}

      {data && (
        <div className="flex-1 px-6 py-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-medium leading-tight">{data.name}</h2>
            <span className={`shrink-0 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${STATUS_COLOR[data.status]}`}>
              {STATUS_LABEL[data.status]}
            </span>
          </div>
          <div className="mt-1 font-mono text-xs text-ink/60">
            {data.kommune.name ?? "Ukjent kommune"}
            {data.address && <> · {data.address}</>}
          </div>

          <Capacity data={data} />

          {data.kommune_share_pct_upper_bound != null && (
            <KommuneShare pct={data.kommune_share_pct_upper_bound} kommune={data.kommune.name ?? "kommunen"} />
          )}

          <Section title="Eierskap">
            <OrgRow label="Operatør" name={data.operator?.name} country={data.operator?.country} brreg={data.operator?.brreg_org_nr} />
            <OrgRow label="Endelig eier" name={data.owner?.name} country={data.owner?.country} brreg={data.owner?.brreg_org_nr} />
          </Section>

          <Section title="Kilder">
            {data.capacity_history.length === 0 ? (
              <p className="text-sm text-ink/60">Ingen kapasitetsobservasjoner registrert.</p>
            ) : (
              <ul className="space-y-3">
                {data.capacity_history.map((obs, i) => (
                  <li key={i} className="rounded border border-ink/10 bg-white/40 p-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                        {SOURCE_TYPE_LABEL[obs.source.source_type] ?? obs.source.source_type}
                      </span>
                      <span className="font-mono text-xs text-ink/50">{obs.observed_at}</span>
                    </div>
                    <a
                      href={obs.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block text-sm text-ink underline decoration-ink/20 underline-offset-2 hover:decoration-ink"
                    >
                      {obs.source.title ?? obs.source.url}
                    </a>
                    <div className="mt-1 font-mono text-xs text-ink/50">{obs.source.domain}</div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="font-mono text-xs text-ink/60">
                        {obs.mw_current != null && `${fmtMw(obs.mw_current)} MW i drift`}
                        {obs.mw_current != null && obs.mw_planned_max != null && " · "}
                        {obs.mw_planned_max != null && `${fmtMw(obs.mw_planned_max)} MW planlagt`}
                        {obs.mw_current == null && obs.mw_planned_max == null && "Ingen MW oppgitt"}
                      </span>
                      <ConfidenceBar value={obs.confidence} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {data.notes && (
            <Section title="Notater">
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80">{data.notes}</p>
            </Section>
          )}

          <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-ink/40">
            Sist verifisert {data.last_verified?.slice(0, 10) ?? "—"}
          </p>
        </div>
      )}
    </aside>
  );
}

function Capacity({ data }: { data: Detail }) {
  const cap = data.latest_capacity;
  const current = cap?.mw_current;
  const planned = cap?.mw_planned_max;
  const hasNumbers = current != null || planned != null;

  return (
    <div className="mt-6 rounded-lg border border-ink/10 bg-white/40 p-5">
      {hasNumbers ? (
        <div className="flex items-baseline gap-6">
          {current != null && (
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink/50">I drift</div>
              <div className="mt-1 font-mono text-3xl tabular-nums">
                {fmtMw(current)} <span className="text-base text-ink/60">MW</span>
              </div>
            </div>
          )}
          {planned != null && (
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Planlagt maks</div>
              <div className="mt-1 font-mono text-3xl tabular-nums text-ink/70">
                {fmtMw(planned)} <span className="text-base text-ink/50">MW</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="font-mono text-sm text-ink/60">Effekt ikke offentlig oppgitt</div>
      )}
      {cap && (
        <div className="mt-4 flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Konfidens</span>
          <ConfidenceBar value={cap.confidence} />
        </div>
      )}
    </div>
  );
}

function KommuneShare({ pct, kommune }: { pct: number; kommune: string }) {
  const display = pct >= 10 ? pct.toFixed(0) : pct.toFixed(1);
  return (
    <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-50/60 p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-amber-900/70">
        Andel av kommunens strøm
      </div>
      <div className="mt-1 text-lg leading-snug">
        Ved 100 % bruk ville dette utgjort{" "}
        <span className="font-mono tabular-nums">{display} %</span>{" "}
        av all elektrisitet brukt i {kommune}.
      </div>
      <div className="mt-2 text-xs text-ink/60">
        Reell utnyttelse er typisk 40–70 %. Tallet er en øvre grense — se{" "}
        <a href="/methodology" className="underline">metode</a>.
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="font-mono text-xs uppercase tracking-widest text-ink/50">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function OrgRow({
  label, name, country, brreg,
}: { label: string; name?: string | null; country?: string | null; brreg?: string | null }) {
  if (!name) return null;
  const isForeign = country && country !== "NO";
  return (
    <div className="flex items-baseline justify-between border-b border-ink/5 py-2 last:border-b-0">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink/50">{label}</div>
        <div className="mt-0.5 text-sm font-medium">{name}</div>
        {brreg && <div className="font-mono text-xs text-ink/50">org.nr {brreg}</div>}
      </div>
      <span
        className={`font-mono text-xs ${isForeign ? "rounded bg-ink text-white px-2 py-0.5" : "text-ink/60"}`}
        title={isForeign ? "Utenlandsk eier" : "Norsk"}
      >
        {country ?? "?"}
      </span>
    </div>
  );
}
