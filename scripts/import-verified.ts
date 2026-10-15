/**
 * Imports data/oregon-2026/verified/** (candidate items, measure text and arguments, their sources
 * and verification notes). Run after seed:inventory, which creates the candidates and measures.
 *
 * Idempotent: sources are upserted by canonical URL, and items and arguments by content hash, so
 * re-running adds only new content. New rows land as `draft` for admin review (TRD v2 §6) and an
 * existing row's status is never changed. Rejected items are skipped.
 *
 * Usage: DATABASE_URL=... npm run seed:verified [-- data/oregon-2026/verified]
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { databaseUrlUnpooled } from "../lib/env";
import * as schema from "../lib/db/schema";
import {
  canonicalUrl,
  contentHash,
  usable,
  verifiedCandidateSchema,
  verifiedMeasureSchema,
  type VerifiedItem,
} from "../lib/seed/verified";

const dir = process.argv[2] ?? "data/oregon-2026/verified";
const url = databaseUrlUnpooled();
if (!url) {
  console.error("No database URL is set (DATABASE_URL or STORAGE1_DATABASE_URL)");
  process.exit(1);
}

async function readAll<T>(sub: string, parse: (v: unknown) => T): Promise<T[]> {
  const files = (await readdir(join(dir, sub))).filter((f) => f.endsWith(".json")).sort();
  return Promise.all(files.map(async (f) => parse(JSON.parse(await readFile(join(dir, sub, f), "utf8")))));
}

const candidates = await readAll("candidates", (v) => verifiedCandidateSchema.parse(v));
const measures = await readAll("measures", (v) => verifiedMeasureSchema.parse(v));

const pool = new Pool({ connectionString: url, max: 1 });
const db = drizzle(pool, { schema });
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const stats = { candidates: 0, measures: 0, sources: 0, items: 0, arguments: 0, skippedMissing: 0 };
const sourceIds = new Map<string, string>();

async function sourceId(tx: Tx, s: VerifiedItem["source"]): Promise<string> {
  const key = canonicalUrl(s.url);
  const cached = sourceIds.get(key);
  if (cached) return cached;
  const [row] = await tx
    .insert(schema.sources)
    .values({
      url: s.url,
      canonicalUrl: key,
      publisher: s.publisher ?? null,
      tier: s.tier,
      publishedAt: s.published_at && /^\d{4}-\d{2}-\d{2}$/.test(s.published_at) ? s.published_at : null,
      retrievedAt: s.retrieved_at ? new Date(s.retrieved_at) : null,
    })
    .onConflictDoUpdate({ target: schema.sources.canonicalUrl, set: { updatedAt: sql`now()` } })
    .returning({ id: schema.sources.id, inserted: sql<boolean>`xmax = 0` });
  if (!row) throw new Error(`source upsert returned no row for ${key}`);
  if (row.inserted) stats.sources++;
  sourceIds.set(key, row.id);
  return row.id;
}

async function recordVerification(tx: Tx, subjectType: string, subjectId: string, v: VerifiedItem["verification"]) {
  await tx.insert(schema.verifications).values({
    subjectType,
    subjectId,
    status: v.status,
    checksFailed: v.checks_failed,
    note: v.note ?? null,
    verifier: "agent",
  });
}

try {
  await db.transaction(async (tx) => {
    for (const m of measures) {
      const [row] = await tx
        .update(schema.ballotMeasures)
        .set({
          ballotLabel: m.ballot_label ?? null,
          summary: m.summary ?? null,
          yesMeans: m.yes_means ?? null,
          noMeans: m.no_means ?? null,
          fiscalImpact: m.fiscal_impact ?? null,
          fullTextUrl: m.full_text_url ?? null,
          gaps: m.gaps,
          updatedAt: sql`now()`,
        })
        .where(eq(schema.ballotMeasures.slug, m.id))
        .returning({ id: schema.ballotMeasures.id });
      if (!row) {
        stats.skippedMissing++;
        console.warn(`measure ${m.id} is not in the database; run seed:inventory first`);
        continue;
      }
      stats.measures++;
      for (const a of usable(m.arguments)) {
        const [inserted] = await tx
          .insert(schema.measureArguments)
          .values({
            measureId: row.id,
            side: a.side,
            kind: a.kind,
            author: a.author ?? null,
            topic: a.topic ?? null,
            statement: a.statement,
            excerpt: a.excerpt ?? null,
            sourceId: await sourceId(tx, a.source),
            contentHash: contentHash(a),
          })
          .onConflictDoNothing()
          .returning({ id: schema.measureArguments.id });
        if (inserted) {
          stats.arguments++;
          await recordVerification(tx, "measure_argument", inserted.id, a.verification);
        }
      }
    }

    for (const c of candidates) {
      const [row] = await tx
        .update(schema.candidates)
        .set({
          occupation: c.occupation ?? null,
          websiteUrl: c.website_url ?? null,
          gaps: c.gaps,
          updatedAt: sql`now()`,
        })
        .where(eq(schema.candidates.slug, c.id))
        .returning({ id: schema.candidates.id });
      if (!row) {
        stats.skippedMissing++;
        console.warn(`candidate ${c.id} is not in the database; run seed:inventory first`);
        continue;
      }
      stats.candidates++;
      const groups = [
        ["bio", c.bio],
        ["position", c.positions],
        ["voting_record", c.voting_record],
      ] as const;
      for (const [kind, items] of groups) {
        for (const i of usable(items)) {
          const [inserted] = await tx
            .insert(schema.candidateItems)
            .values({
              candidateId: row.id,
              kind,
              topic: i.topic ?? null,
              statement: i.statement,
              excerpt: i.excerpt ?? null,
              sourceId: await sourceId(tx, i.source),
              contentHash: contentHash(i),
            })
            .onConflictDoNothing()
            .returning({ id: schema.candidateItems.id });
          if (inserted) {
            stats.items++;
            await recordVerification(tx, "candidate_item", inserted.id, i.verification);
          }
        }
      }
    }

    await tx.insert(schema.ingestionRuns).values({ scope: `verified:${dir}`, finishedAt: new Date(), stats });
  });
  console.log("verified import:", stats);
} finally {
  await pool.end();
}
