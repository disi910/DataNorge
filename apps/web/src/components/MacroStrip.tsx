import { useEffect, useState } from "react";
import { fetchMacroFacts, type MacroFacts } from "../api";

export function MacroStrip() {
  const [m, setM] = useState<MacroFacts | null>(null);
  useEffect(() => {
    fetchMacroFacts().then(setM).catch(() => setM(null));
  }, []);
  if (!m) return null;

  const latest = m.consumption_trajectory_twh[m.consumption_trajectory_twh.length - 1];
  const range =
    latest.range_low != null && latest.range_high != null
      ? `${latest.range_low}-${latest.range_high} TWh`
      : `${latest.twh} TWh`;

  return (
    <div className="border-b border-ink/10 bg-paper/60 px-6 py-3">
      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-ink/60">
        <Stat label="Datasentre i drift (Nkom)" value={`${m.registry.data_centres_in_operation}`} />
        <Stat label="Operatører (Nkom)" value={`${m.registry.operators_in_nkom_register}`} />
        <Stat label={`Forbruk ${latest.year}`} value={range} />
        <Stat
          label={`Reservert nett ${m.statnett_reservations.as_of.slice(0, 7)}`}
          value={`${m.statnett_reservations.data_centres_reserved_mw.toLocaleString("nb-NO")} MW`}
        />
        <Stat
          label="Installert (drift)"
          value={`${m.installed_capacity_mw.operational_named_sites_low}-${m.installed_capacity_mw.operational_named_sites_high} MW`}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-ink/40">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
