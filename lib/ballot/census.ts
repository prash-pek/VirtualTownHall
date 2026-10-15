import "server-only";

import { mentionsOregon, parseCensusResponse, type CensusDistricts } from "./districts";

const endpoint = "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress";

/**
 * Free US Census geocoder (no key). Returns null when the address isn't found. The geocoder needs a city,
 * state or ZIP, so an address without one ("5055 N Greeley Ave") is retried with Oregon added.
 */
export async function geocodeAddress(address: string): Promise<CensusDistricts | null> {
  const found = await lookup(address);
  return found ?? (mentionsOregon(address) ? null : lookup(`${address}, OR`));
}

async function lookup(address: string): Promise<CensusDistricts | null> {
  const url = new URL(endpoint);
  url.search = new URLSearchParams({
    address,
    benchmark: "Public_AR_Current",
    vintage: "Current_Current",
    layers: "all",
    format: "json",
  }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000), cache: "no-store" });
  if (!res.ok) throw new Error(`Census geocoder returned ${res.status}`);
  return parseCensusResponse(await res.json());
}
