/**
 * Imports data/oregon-2026/inventory.json into elections / jurisdictions / races / candidates /
 * ballot_measures. Idempotent: rows are upserted by slug. Candidates and measures land as `draft`
 * (TRD v2 §6) and an upsert never changes the status of a row that already exists, so re-running
 * after admin review can't unpublish or republish anything.
 *
 * Each table is written in one statement (jurisdictions one per level, parents first), and the import
 * check (lib/seed/check.ts) runs before commit; any mismatch rolls the import back. A run whose
 * inventory file and import code match an earlier finished run is skipped.
 *
 * Content (items, arguments, sources) comes from verified/** (seed:verified).
 *
 * Usage: DATABASE_URL=... npm run seed:inventory [-- path/to/inventory.json]
 */
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { databaseUrlUnpooled } from "../lib/env";

import * as schema from "../lib/db/schema";
import { checkInventory } from "../lib/seed/check";
import { sortJurisdictionsParentFirst } from "../lib/seed/inventory";
import { loadInventory } from "../lib/seed/load";

const path = process.argv[2] ?? "data/oregon-2026/inventory.json";
const url = databaseUrlUnpooled();
if (!url) {
  console.error("No database URL is set (DATABASE_URL or STORAGE1_DATABASE_URL)");
  process.exit(1);
}

const { inv, fingerprint } = await loadInventory(path);
const pool = new Pool({ connectionString: url, max: 1 });
const db = drizzle(pool, { schema });
const scope = `inventory:${inv.election.id}:${fingerprint}`;
const excluded = (col: string) => sql.raw(`excluded.${col}`);

try {
  const [done] = await db
    .select({ id: schema.ingestionRuns.id })
    .from(schema.ingestionRuns)
    .where(eq(schema.ingestionRuns.scope, scope))
    .limit(1);
  if (done) {
    console.log(`inventory import: skipped, ${scope} already imported`);
    process.exit(0);
  }

  const stats = await db.transaction(async (tx) => {
    const [election] = await tx
      .insert(schema.elections)
      .values({ slug: inv.election.id, name: inv.election.name, date: inv.election.date, state: "OR" })
      .onConflictDoUpdate({
        target: schema.elections.slug,
        set: { name: excluded("name"), date: excluded("date"), updatedAt: sql`now()` },
      })
      .returning({ id: schema.elections.id });
    if (!election) throw new Error("election upsert returned no row");

    // Parents first: group jurisdictions by depth so each level can resolve its parent's id.
    const byId = new Map(inv.jurisdictions.map((j) => [j.id, j]));
    const depth = (id: string): number => {
      const parent = byId.get(id)?.parent_id;
      return parent ? depth(parent) + 1 : 0;
    };
    const levels: (typeof inv.jurisdictions)[] = [];
    for (const j of sortJurisdictionsParentFirst(inv.jurisdictions)) (levels[depth(j.id)] ??= []).push(j);
    const jurisdictionId = new Map<string, string>();
    for (const level of levels) {
      if (!level?.length) continue;
      const rows = await tx
        .insert(schema.jurisdictions)
        .values(
          level.map((j) => ({
            slug: j.id,
            name: j.name,
            type: j.type,
            parentId: j.parent_id ? jurisdictionId.get(j.parent_id)! : null,
          })),
        )
        .onConflictDoUpdate({
          target: schema.jurisdictions.slug,
          set: {
            name: excluded("name"),
            type: excluded("type"),
            parentId: excluded("parent_id"),
            updatedAt: sql`now()`,
          },
        })
        .returning({ id: schema.jurisdictions.id, slug: schema.jurisdictions.slug });
      for (const r of rows) jurisdictionId.set(r.slug, r.id);
    }

    const raceRows = await tx
      .insert(schema.races)
      .values(
        inv.races.map((r, i) => ({
          electionId: election.id,
          jurisdictionId: jurisdictionId.get(r.jurisdiction_id)!,
          slug: r.id,
          office: r.office,
          districtLabel: r.district,
          seats: r.seats,
          partisan: r.partisan,
          rankedChoice: r.ranked_choice ?? false,
          ballotOrder: i + 1,
        })),
      )
      .onConflictDoUpdate({
        target: schema.races.slug,
        set: {
          jurisdictionId: excluded("jurisdiction_id"),
          office: excluded("office"),
          districtLabel: excluded("district_label"),
          seats: excluded("seats"),
          partisan: excluded("partisan"),
          rankedChoice: excluded("ranked_choice"),
          ballotOrder: excluded("ballot_order"),
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: schema.races.id, slug: schema.races.slug });
    const raceId = new Map(raceRows.map((r) => [r.slug, r.id]));

    // Candidates keep the order the filing source lists them in.
    const candidateOrder = new Map(inv.races.flatMap((r) => r.candidate_ids.map((c, i) => [c, i + 1] as const)));
    await tx
      .insert(schema.candidates)
      .values(
        inv.candidates.map((c) => ({
          raceId: raceId.get(c.race_id)!,
          slug: c.id,
          name: c.name,
          party: c.party,
          incumbent: c.incumbent,
          profileSource: "public_seed" as const,
          ballotOrder: candidateOrder.get(c.id) ?? 0,
          status: "draft" as const,
        })),
      )
      .onConflictDoUpdate({
        target: schema.candidates.slug,
        set: {
          raceId: excluded("race_id"),
          name: excluded("name"),
          party: excluded("party"),
          incumbent: excluded("incumbent"),
          ballotOrder: excluded("ballot_order"),
          updatedAt: sql`now()`,
        },
      });

    if (inv.measures.length)
      await tx
        .insert(schema.ballotMeasures)
        .values(
          inv.measures.map((m, i) => ({
            electionId: election.id,
            jurisdictionId: jurisdictionId.get(m.jurisdiction_id)!,
            slug: m.id,
            number: m.number,
            title: m.title,
            ballotOrder: i + 1,
            status: "draft" as const,
          })),
        )
        .onConflictDoUpdate({
          target: schema.ballotMeasures.slug,
          set: {
            jurisdictionId: excluded("jurisdiction_id"),
            number: excluded("number"),
            title: excluded("title"),
            ballotOrder: excluded("ballot_order"),
            updatedAt: sql`now()`,
          },
        });

    // The database must now match the file, or nothing is committed.
    const problems = await checkInventory(tx, inv);
    if (problems.length)
      throw new Error(`inventory import: the database doesn't match ${path}, rolling back:\n${problems.join("\n")}`);

    const stats = {
      jurisdictions: inv.jurisdictions.length,
      races: inv.races.length,
      candidates: inv.candidates.length,
      measures: inv.measures.length,
    };
    await tx.insert(schema.ingestionRuns).values({ scope, finishedAt: new Date(), stats });
    return stats;
  });
  console.log(`Imported ${path}:`, stats);
} finally {
  await pool.end();
}
