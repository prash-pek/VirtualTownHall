/** Client-safe shapes for the ballot catalog and a voter's saved ballot. */

export type CatalogCandidate = { slug: string; name: string; party: string | null; incumbent: boolean | null };

export type CatalogRace = {
  key: `race:${string}`;
  slug: string;
  office: string;
  districtLabel: string | null;
  jurisdiction: string;
  jurisdictionSlug: string;
  candidates: CatalogCandidate[];
};

export type CatalogMeasure = {
  key: `measure:${string}`;
  slug: string;
  number: string;
  title: string;
  jurisdiction: string;
  jurisdictionSlug: string;
};

/** Races and measures are each already in printed-ballot order; races come before measures. */
export type Catalog = { races: CatalogRace[]; measures: CatalogMeasure[] };

export type CatalogItem = CatalogRace | CatalogMeasure;

export function isRace(item: CatalogItem): item is CatalogRace {
  return item.key.startsWith("race:");
}

export function itemTitle(item: CatalogItem): string {
  return isRace(item)
    ? `${item.office}${item.districtLabel ? `, ${item.districtLabel}` : ""}`
    : `Measure ${item.number}: ${item.title}`;
}

export function itemHref(item: CatalogItem) {
  return isRace(item) ? (`/races/${item.slug}` as const) : (`/measures/${item.slug}` as const);
}

/** Sorts ballot keys into printed-ballot order, dropping keys the catalog doesn't know. */
export function inBallotOrder(keys: readonly string[], catalog: Catalog): BallotKey[] {
  const index = new Map<string, number>([...catalog.races, ...catalog.measures].map((i, n) => [i.key, n]));
  return [...new Set(keys)]
    .filter((k): k is BallotKey => index.has(k))
    .sort((a, b) => (index.get(a) ?? 0) - (index.get(b) ?? 0));
}

/** A voter's own pick for one item: a candidate slug, "yes"/"no", or not decided yet. */
export type Choice = string;
export const undecided = "undecided";
export const skipped = "skip";

/** A saved ballot is a list of item keys, e.g. "race:or-us-senate" or "measure:portland-26-267". */
export type BallotKey = CatalogRace["key"] | CatalogMeasure["key"];

const keyPattern = /^(race|measure):[a-z0-9][a-z0-9-]{0,99}$/;

export function isBallotKey(value: unknown): value is BallotKey {
  return typeof value === "string" && keyPattern.test(value);
}

/** Keeps valid keys, drops duplicates, preserves order, caps the list size. */
export function sanitizeBallot(value: unknown, max = 300): BallotKey[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(isBallotKey))].slice(0, max);
}
