const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8001";

export type DataCenterProps = {
  id: string;
  name: string;
  status: "planned" | "under_construction" | "operational" | "decommissioned";
  kommune_code: string | null;
  kommune_name: string | null;
  operator: string | null;
  owner: string | null;
  owner_country: string | null;
  mw_current: number | null;
  mw_planned_max: number | null;
  confidence: number | null;
};

export type KommuneProps = {
  code: string;
  name: string;
  total_electricity_gwh_year: number | null;
};

export type FC<P> = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string | number;
    geometry: GeoJSON.Geometry;
    properties: P;
  }>;
};

export async function fetchKommuner(): Promise<FC<KommuneProps>> {
  const r = await fetch(`${BASE}/kommuner`);
  if (!r.ok) throw new Error(`/kommuner ${r.status}`);
  return r.json();
}

export async function fetchDataCenters(): Promise<FC<DataCenterProps>> {
  const r = await fetch(`${BASE}/data-centers`);
  if (!r.ok) throw new Error(`/data-centers ${r.status}`);
  return r.json();
}

export type CapacityObservation = {
  mw_current: number | null;
  mw_planned_max: number | null;
  confidence: number;
  observed_at: string | null;
  extracted_by: string;
  source: { url: string; title: string | null; domain: string | null; source_type: string };
};

export type DataCenterDetail = {
  id: string;
  name: string;
  status: DataCenterProps["status"];
  address: string | null;
  notes: string | null;
  first_seen: string | null;
  last_verified: string | null;
  location: { lng: number; lat: number };
  kommune: { code: string | null; name: string | null; total_electricity_gwh_year: number | null };
  operator: {
    id: string;
    name: string;
    brreg_org_nr: string | null;
    country: string;
    address: string | null;
  } | null;
  owner: {
    id: string;
    name: string;
    country: string;
    brreg_org_nr: string | null;
  } | null;
  latest_capacity: CapacityObservation | null;
  capacity_history: CapacityObservation[];
  kommune_share: KommuneShare | null;
  kommune_share_pct_upper_bound: number | null;
};

export type KommuneShare = {
  upper_bound_pct: number;
  realistic_low_pct: number;
  realistic_high_pct: number;
  utilization_low_pct: number;
  utilization_high_pct: number;
};

export type MacroFacts = {
  as_of: string;
  registry: { operators_in_nkom_register: number; data_centres_in_operation: number; registry_date: string; source_url: string };
  consumption_trajectory_twh: Array<{
    year: number; twh: number; basis: string; confidence: number;
    range_low?: number; range_high?: number;
  }>;
  consumption_long_term_projection_twh: Array<{ year: number; twh: number; basis: string }>;
  installed_capacity_mw: { operational_named_sites_low: number; operational_named_sites_high: number; comment: string };
  statnett_reservations: {
    data_centres_reserved_mw: number;
    data_centres_mature_queue_mw: number;
    all_sectors_total_reserved_mw: number;
    as_of: string;
    share_data_centres_of_reserved_pct: number;
    share_data_centres_of_queue_pct: number;
    source_url: string;
  };
  utilization_band: { low_pct: number; high_pct: number; comment: string };
  context_equivalents_for_3_twh: Array<{ label: string; value: string }>;
  household_electricity_total_twh_2024: number;
};

export async function fetchMacroFacts(): Promise<MacroFacts> {
  const r = await fetch(`${BASE}/macro`);
  if (!r.ok) throw new Error(`/macro ${r.status}`);
  return r.json();
}

export async function fetchDataCenter(id: string): Promise<DataCenterDetail> {
  const r = await fetch(`${BASE}/data-centers/${id}`);
  if (!r.ok) throw new Error(`/data-centers/${id} ${r.status}`);
  return r.json();
}
