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
