/**
 * Shape of data/oregon-2026/inventory.json (see data/oregon-2026/README.md).
 * Objects are loose so fields added by the data pipeline don't break the import.
 */
import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase kebab-case slug");

export const jurisdictionTypes = [
  "state",
  "county",
  "city",
  "metro",
  "congressional_district",
  "state_senate_district",
  "state_house_district",
  "school_district",
  "special_district",
  "other",
] as const;

export const inventorySchema = z.looseObject({
  election: z.looseObject({
    id: slug,
    name: z.string().min(1),
    date: z.iso.date(),
    sources: z.array(z.url()),
  }),
  jurisdictions: z.array(
    z.looseObject({
      id: slug,
      name: z.string().min(1),
      type: z.enum(jurisdictionTypes),
      parent_id: slug.nullable(),
      zips: z.array(z.string().regex(/^\d{5}$/)).default([]),
    }),
  ),
  races: z.array(
    z.looseObject({
      id: slug,
      jurisdiction_id: slug,
      office: z.string().min(1),
      district: z.string().nullable(),
      seats: z.number().int().positive().nullable(),
      partisan: z.boolean(),
      candidate_ids: z.array(slug),
      ranked_choice: z.boolean().optional(),
      source_url: z.url(),
    }),
  ),
  measures: z.array(
    z.looseObject({
      id: slug,
      jurisdiction_id: slug,
      number: z.string().min(1),
      title: z.string().min(1),
      source_url: z.url(),
    }),
  ),
  candidates: z.array(
    z.looseObject({
      id: slug,
      name: z.string().min(1),
      race_id: slug,
      party: z.string().nullable(),
      incumbent: z.boolean().nullable(),
      filing_source_url: z.url(),
    }),
  ),
});

export type Inventory = z.infer<typeof inventorySchema>;

/** Referential checks the JSON schema can't express. Returns human-readable problems; empty means OK. */
export function checkInventoryIntegrity(inv: Inventory): string[] {
  const problems: string[] = [];
  const dupes = (kind: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) problems.push(`duplicate ${kind} id ${id}`);
      seen.add(id);
    }
    return seen;
  };

  const jurisdictionIds = dupes(
    "jurisdiction",
    inv.jurisdictions.map((j) => j.id),
  );
  const raceIds = dupes(
    "race",
    inv.races.map((r) => r.id),
  );
  const candidateIds = dupes(
    "candidate",
    inv.candidates.map((c) => c.id),
  );
  dupes(
    "measure",
    inv.measures.map((m) => m.id),
  );

  for (const j of inv.jurisdictions) {
    if (j.parent_id && !jurisdictionIds.has(j.parent_id))
      problems.push(`jurisdiction ${j.id}: unknown parent ${j.parent_id}`);
  }
  for (const r of inv.races) {
    if (!jurisdictionIds.has(r.jurisdiction_id))
      problems.push(`race ${r.id}: unknown jurisdiction ${r.jurisdiction_id}`);
    for (const c of r.candidate_ids) {
      if (!candidateIds.has(c)) problems.push(`race ${r.id}: unknown candidate ${c}`);
    }
  }
  for (const m of inv.measures) {
    if (!jurisdictionIds.has(m.jurisdiction_id))
      problems.push(`measure ${m.id}: unknown jurisdiction ${m.jurisdiction_id}`);
  }
  const raceById = new Map(inv.races.map((r) => [r.id, r]));
  for (const c of inv.candidates) {
    const race = raceById.get(c.race_id);
    if (!raceIds.has(c.race_id) || !race) problems.push(`candidate ${c.id}: unknown race ${c.race_id}`);
    else if (!race.candidate_ids.includes(c.id)) problems.push(`candidate ${c.id}: not listed in race ${c.race_id}`);
  }
  return problems;
}

/** Parents before children, so parent_id can be resolved in a single pass. */
export function sortJurisdictionsParentFirst<T extends { id: string; parent_id: string | null }>(items: T[]): T[] {
  const byId = new Map(items.map((j) => [j.id, j]));
  const out: T[] = [];
  const state = new Map<string, "visiting" | "done">();
  const visit = (j: T) => {
    const s = state.get(j.id);
    if (s === "done") return;
    if (s === "visiting") throw new Error(`jurisdiction parent cycle at ${j.id}`);
    state.set(j.id, "visiting");
    const parent = j.parent_id ? byId.get(j.parent_id) : undefined;
    if (parent) visit(parent);
    state.set(j.id, "done");
    out.push(j);
  };
  items.forEach(visit);
  return out;
}
