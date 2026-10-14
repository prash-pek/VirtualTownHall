/**
 * Imports data/oregon-2026/inventory.json into elections / jurisdictions / races / candidates /
 * ballot_measures. Idempotent: rows are upserted by slug. Candidates and measures land as `draft`
 * (TRD v2 §6) and an upsert never changes the status of a row that already exists, so re-running
 * after admin review can't unpublish or republish anything.
 *
 * Content (items, arguments, sources) comes from verified/** in a later phase.
 *
 * Usage: DATABASE_URL=... npm run seed:inventory [-- path/to/inventory.json]
 */
import { readFile } from "node:fs/promises";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../lib/db/schema";
import { checkInventoryIntegrity, inventorySchema, sortJurisdictionsParentFirst } from "../lib/seed/inventory";

const path = process.argv[2] ?? "data/oregon-2026/inventory.json";
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const inv = inventorySchema.parse(JSON.parse(await readFile(path, "utf8")));
const problems = checkInventoryIntegrity(inv);
if (problems.length) {
  console.error(`inventory has ${problems.length} integrity problems:\n${problems.join("\n")}`);
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 1 });
const db = drizzle(pool, { schema });
const excluded = (col: string) => sql.raw(`excluded.${col}`);
const one = <T>(rows: T[]): T => {
  if (!rows[0]) throw new Error("upsert returned no row");
  return rows[0];
};

try {
  const stats = await db.transaction(async (tx) => {
    const election = one(
      await tx
        .insert(schema.elections)
        .values({ slug: inv.election.id, name: inv.election.name, date: inv.election.date, state: "OR" })
        .onConflictDoUpdate({
          target: schema.elections.slug,
          set: { name: excluded("name"), date: excluded("date"), updatedAt: sql`now()` },
        })
        .returning({ id: schema.elections.id }),
    );

    const jurisdictionId = new Map<string, string>();
    for (const j of sortJurisdictionsParentFirst(inv.jurisdictions)) {
      const row = one(
        await tx
          .insert(schema.jurisdictions)
          .values({
            slug: j.id,
            name: j.name,
            type: j.type,
            parentId: j.parent_id ? jurisdictionId.get(j.parent_id) : null,
          })
          .onConflictDoUpdate({
            target: schema.jurisdictions.slug,
            set: {
              name: excluded("name"),
              type: excluded("type"),
              parentId: excluded("parent_id"),
              updatedAt: sql`now()`,
            },
          })
          .returning({ id: schema.jurisdictions.id }),
      );
      jurisdictionId.set(j.id, row.id);
    }

    const raceId = new Map<string, string>();
    for (const [i, r] of inv.races.entries()) {
      const row = one(
        await tx
          .insert(schema.races)
          .values({
            electionId: election.id,
            jurisdictionId: jurisdictionId.get(r.jurisdiction_id)!,
            slug: r.id,
            office: r.office,
            districtLabel: r.district,
            seats: r.seats,
            partisan: r.partisan,
            rankedChoice: r.ranked_choice ?? false,
            ballotOrder: i + 1,
          })
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
          .returning({ id: schema.races.id }),
      );
      raceId.set(r.id, row.id);
    }

    // Candidates keep the order the filing source lists them in.
    const candidateOrder = new Map(inv.races.flatMap((r) => r.candidate_ids.map((c, i) => [c, i + 1] as const)));
    for (const c of inv.candidates) {
      await tx
        .insert(schema.candidates)
        .values({
          raceId: raceId.get(c.race_id)!,
          slug: c.id,
          name: c.name,
          party: c.party,
          incumbent: c.incumbent,
          profileSource: "public_seed",
          ballotOrder: candidateOrder.get(c.id) ?? 0,
          status: "draft",
        })
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
    }

    for (const [i, m] of inv.measures.entries()) {
      await tx
        .insert(schema.ballotMeasures)
        .values({
          electionId: election.id,
          jurisdictionId: jurisdictionId.get(m.jurisdiction_id)!,
          slug: m.id,
          number: m.number,
          title: m.title,
          ballotOrder: i + 1,
          status: "draft",
        })
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
    }

    return {
      jurisdictions: inv.jurisdictions.length,
      races: inv.races.length,
      candidates: inv.candidates.length,
      measures: inv.measures.length,
    };
  });

  await db.insert(schema.ingestionRuns).values({
    scope: `inventory:${inv.election.id}`,
    finishedAt: new Date(),
    stats,
  });
  console.log(`Imported ${path}:`, stats);
} finally {
  await pool.end();
}
