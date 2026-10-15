import "server-only";

import { parseCensusResponse, type CensusDistricts } from "./districts";
import { withState, type StateCode } from "./states";

const endpoint = "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress";

/** Free US Census geocoder (no key), any US address. Returns null when the address isn't found. */
export async function geocodeAddress(address: string, state: StateCode): Promise<CensusDistricts | null> {
  const url = new URL(endpoint);
  url.search = new URLSearchParams({
    address: withState(address, state),
    benchmark: "Public_AR_Current",
    vintage: "Current_Current",
    layers: "all",
    format: "json",
  }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000), cache: "no-store" });
  if (!res.ok) throw new Error(`Census geocoder returned ${res.status}`);
  return parseCensusResponse(await res.json());
}
