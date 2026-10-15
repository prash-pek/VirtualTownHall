/** Client-safe shapes for the ballot catalog and a voter's saved ballot. */

export type CatalogRace = {
  key: `race:${string}`;
  slug: string;
  office: string;
  districtLabel: string | null;
  jurisdiction: string;
  jurisdictionSlug: string;
  candidates: { name: string; party: string | null; incumbent: boolean | null }[];
};

export type CatalogMeasure = {
  key: `measure:${string}`;
  slug: string;
  number: string;
  title: string;
  jurisdiction: string;
  jurisdictionSlug: string;
};

export type Catalog = { races: CatalogRace[]; measures: CatalogMeasure[] };

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
