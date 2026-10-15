import "server-only";

import { asc, eq } from "drizzle-orm";
import { cache } from "react";

import { getDb } from "@/lib/db/client";
import { ballotMeasures, candidates, jurisdictions, races } from "@/lib/db/schema";

import type { JurisdictionRef } from "./districts";
import type { Catalog, CatalogRace } from "./types";

/**
 * Every race and measure in the inventory, in ballot order. Candidate names and parties come from
 * official filings and are shown before content review; profiles stay behind the review queue.
 */
export const getCatalog = cache(async (): Promise<Catalog> => {
  const db = getDb();
  const [raceRows, candidateRows, measureRows] = await Promise.all([
    db
      .select({
        id: races.id,
        slug: races.slug,
        office: races.office,
        districtLabel: races.districtLabel,
        jurisdiction: jurisdictions.name,
        jurisdictionSlug: jurisdictions.slug,
      })
      .from(races)
      .innerJoin(jurisdictions, eq(races.jurisdictionId, jurisdictions.id))
      .orderBy(asc(races.ballotOrder)),
    db
      .select({
        raceId: candidates.raceId,
        name: candidates.name,
        party: candidates.party,
        incumbent: candidates.incumbent,
      })
      .from(candidates)
      .orderBy(asc(candidates.ballotOrder)),
    db
      .select({
        slug: ballotMeasures.slug,
        number: ballotMeasures.number,
        title: ballotMeasures.title,
        jurisdiction: jurisdictions.name,
        jurisdictionSlug: jurisdictions.slug,
      })
      .from(ballotMeasures)
      .innerJoin(jurisdictions, eq(ballotMeasures.jurisdictionId, jurisdictions.id))
      .orderBy(asc(ballotMeasures.ballotOrder)),
  ]);

  const byRace = Map.groupBy(candidateRows, (c) => c.raceId);
  return {
    races: raceRows.map(({ id, ...r }): CatalogRace => ({
      ...r,
      key: `race:${r.slug}`,
      candidates: (byRace.get(id) ?? []).map(({ name, party, incumbent }) => ({ name, party, incumbent })),
    })),
    measures: measureRows.map((m) => ({ ...m, key: `measure:${m.slug}` as const })),
  };
});

export const getJurisdictionRefs = cache(async (): Promise<JurisdictionRef[]> => {
  const db = getDb();
  const rows = await db
    .select({
      id: jurisdictions.id,
      slug: jurisdictions.slug,
      name: jurisdictions.name,
      type: jurisdictions.type,
      parentId: jurisdictions.parentId,
    })
    .from(jurisdictions);
  const slugById = new Map(rows.map((r) => [r.id, r.slug]));
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    type: r.type,
    parentSlug: r.parentId ? (slugById.get(r.parentId) ?? null) : null,
  }));
});
