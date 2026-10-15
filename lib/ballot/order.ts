/**
 * Printed Oregon ballot order: federal, state, legislative, county, courts, city, local, then
 * measures (state, county, city, local) by number. Within a level, the inventory's order is kept.
 */
const levels: Record<string, number> = {
  state: 1,
  state_senate_district: 2,
  state_house_district: 3,
  county: 4,
  other: 5,
  metro: 6,
  city: 7,
  school_district: 8,
  special_district: 9,
};

export function raceLevel(r: { office: string; jurisdictionType: string }): number {
  if (r.jurisdictionType === "congressional_district" || /^(US|U\.S\.)\s/i.test(r.office)) return 0;
  return levels[r.jurisdictionType] ?? 10;
}

export function measureLevel(m: { jurisdictionType: string }): number {
  return levels[m.jurisdictionType] ?? 10;
}

/** Stable sort by level, keeping input order inside a level. */
export function sortByLevel<T>(rows: T[], level: (row: T) => number): T[] {
  return rows
    .map((row, i) => ({ row, i, l: level(row) }))
    .sort((a, b) => a.l - b.l || a.i - b.i)
    .map((x) => x.row);
}

/** Measure numbers like "26-267" or "119" compare numerically part by part. */
export function compareMeasureNumbers(a: string, b: string): number {
  return a.localeCompare(b, "en", { numeric: true });
}
