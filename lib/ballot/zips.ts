import "server-only";

import type { ZipDistricts } from "./districts";
import oregonZips from "./oregon-zips.json";

/** "97201" or "97201-1234". */
export const zipPattern = /^\d{5}(?:-\d{4})?$/;

/** Oregon ZIPs from Census 2020 relationship files (scripts/build-oregon-zips.py). Null when unknown. */
export function lookupOregonZip(zip: string): ZipDistricts | null {
  return (oregonZips as unknown as Record<string, ZipDistricts>)[zip.slice(0, 5)] ?? null;
}
