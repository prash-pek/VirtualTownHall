/**
 * Turns a Census geocoder response into the districts we care about, and matches those districts to
 * our jurisdictions. Pure, so it's unit-tested; the network call lives in census.ts.
 *
 * Suggestions are a starting point, not a verified ballot: voters add and remove items freely.
 */

export type CensusDistricts = {
  matchedAddress: string;
  county: string | null;
  place: string | null;
  congressional: number | null;
  stateSenate: number | null;
  stateHouse: number | null;
  schoolDistricts: string[];
};

type CensusEntry = { NAME?: string; BASENAME?: string };
type CensusGeographies = Record<string, CensusEntry[] | undefined>;

/** Layer keys carry a vintage ("2026 State Legislative Districts - Upper"), so match on the stable suffix. */
function layer(geos: CensusGeographies, pattern: RegExp): CensusEntry[] {
  for (const [key, entries] of Object.entries(geos)) if (pattern.test(key) && entries) return entries;
  return [];
}

function districtNumber(entries: CensusEntry[]): number | null {
  const n = Number.parseInt(entries[0]?.BASENAME ?? "", 10);
  return Number.isFinite(n) ? n : null;
}

/** Returns null when the geocoder found no match for the address. */
export function parseCensusResponse(body: unknown): CensusDistricts | null {
  const match = (body as { result?: { addressMatches?: { matchedAddress: string; geographies: CensusGeographies }[] } })
    ?.result?.addressMatches?.[0];
  if (!match) return null;
  const geos = match.geographies;
  return {
    matchedAddress: match.matchedAddress,
    county: layer(geos, /^Counties$/)[0]?.NAME ?? null,
    place: layer(geos, /Incorporated Places$/)[0]?.BASENAME ?? null,
    congressional: districtNumber(layer(geos, /Congressional Districts$/)),
    stateSenate: districtNumber(layer(geos, /State Legislative Districts - Upper$/)),
    stateHouse: districtNumber(layer(geos, /State Legislative Districts - Lower$/)),
    schoolDistricts: [
      ...layer(geos, /Unified School Districts$/),
      ...layer(geos, /Elementary School Districts$/),
      ...layer(geos, /Secondary School Districts$/),
    ].flatMap((e) => (e.NAME ? [e.NAME] : [])),
  };
}

export type JurisdictionRef = { slug: string; name: string; type: string; parentSlug: string | null };

/** "Reynolds School District No. 7" and "Reynolds School District 7" compare equal. */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\bno\.?\s*(?=\d)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export type Suggestion = {
  /** Jurisdictions the address is in, as far as Census data can tell. */
  matched: string[];
  /** Special districts in the voter's county. Census has no maps for these, so the voter decides. */
  nearby: string[];
};

export function matchJurisdictions(d: CensusDistricts, all: JurisdictionRef[]): Suggestion {
  const county = d.county ? normalizeName(d.county) : null;
  const place = d.place ? normalizeName(`City of ${d.place}`) : null;
  const schools = new Set(d.schoolDistricts.map(normalizeName));
  const countySlug = all.find((j) => j.type === "county" && normalizeName(j.name) === county)?.slug ?? null;

  const matched: string[] = [];
  const nearby: string[] = [];
  for (const j of all) {
    const name = normalizeName(j.name);
    const isMatch =
      j.type === "state" ||
      (j.type === "county" && name === county) ||
      (j.type === "city" && name === place) ||
      (j.type === "congressional_district" && j.slug === `or-cd-${d.congressional}`) ||
      (j.type === "state_senate_district" && j.slug === `or-sd-${d.stateSenate}`) ||
      (j.type === "state_house_district" && j.slug === `or-hd-${d.stateHouse}`) ||
      (j.type === "school_district" && schools.has(name)) ||
      // County-wide offices that aren't the county itself, such as the circuit court.
      (j.type === "other" && countySlug !== null && j.parentSlug === countySlug);
    if (isMatch) matched.push(j.slug);
    else if (j.type === "special_district" && countySlug !== null && j.parentSlug === countySlug) nearby.push(j.slug);
  }
  return { matched, nearby };
}

/** One ZIP's overlap with each layer: [name or district number, share of the ZIP's land area]. */
export type ZipDistricts = {
  county: [string, number][];
  city: [string, number][];
  cd: [number, number][];
  sd: [number, number][];
  hd: [number, number][];
};

export type ZipSuggestion = Suggestion & {
  /** Jurisdictions that cover only part of the ZIP. The voter picks the ones on their ballot. */
  possible: string[];
};

/**
 * Matches a ZIP the same way as an address, except that a ZIP can cross district lines. Jurisdictions
 * that cover the whole ZIP are suggested; ones that cover only part of it come back as `possible`.
 */
export function matchZip(z: ZipDistricts, all: JurisdictionRef[]): ZipSuggestion {
  // County and legislative districts tile the state, so one entry means the whole ZIP. Cities don't.
  const level = <K>(parts: [K, number][], key: K, tiles: boolean): "whole" | "part" | null => {
    const hit = parts.find(([k]) => k === key);
    if (!hit) return null;
    return hit[1] >= 0.99 || (tiles && parts.length === 1) ? "whole" : "part";
  };
  const counties = z.county.map(([n, s]): [string, number] => [normalizeName(`${n} County`), s]);
  const cities = z.city.map(([n, s]): [string, number] => [normalizeName(`City of ${n}`), s]);
  const countyLevel = new Map<string, "whole" | "part">();
  for (const j of all) {
    if (j.type !== "county") continue;
    const l = level(counties, normalizeName(j.name), true);
    if (l) countyLevel.set(j.slug, l);
  }
  const district = (slug: string, prefix: string, parts: [number, number][]) => {
    const n = Number.parseInt(slug.slice(prefix.length), 10);
    return slug.startsWith(prefix) ? level(parts, n, true) : null;
  };

  const matched: string[] = [];
  const possible: string[] = [];
  const nearby: string[] = [];
  for (const j of all) {
    const parentLevel = j.parentSlug ? (countyLevel.get(j.parentSlug) ?? null) : null;
    const l =
      j.type === "state"
        ? "whole"
        : j.type === "county"
          ? (countyLevel.get(j.slug) ?? null)
          : j.type === "city"
            ? level(cities, normalizeName(j.name), false)
            : j.type === "congressional_district"
              ? district(j.slug, "or-cd-", z.cd)
              : j.type === "state_senate_district"
                ? district(j.slug, "or-sd-", z.sd)
                : j.type === "state_house_district"
                  ? district(j.slug, "or-hd-", z.hd)
                  : j.type === "other"
                    ? parentLevel
                    : null;
    if (l === "whole") matched.push(j.slug);
    else if (l === "part") possible.push(j.slug);
    // Census has no ZIP maps for school and special districts, so the voter decides.
    else if ((j.type === "special_district" || j.type === "school_district") && parentLevel) nearby.push(j.slug);
  }
  return { matched, possible, nearby };
}
