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
  kommune_share_pct_upper_bound: number | null;
};

export async function fetchDataCenter(id: string): Promise<DataCenterDetail> {
  const r = await fetch(`${BASE}/data-centers/${id}`);
  if (!r.ok) throw new Error(`/data-centers/${id} ${r.status}`);
  return r.json();
}
