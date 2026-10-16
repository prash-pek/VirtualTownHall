/**
 * Imports data/oregon-2026/verified/** (candidate items, measure text and arguments, their sources
 * and verification notes). Run after seed:inventory, which creates the candidates and measures.
 *
 * Idempotent: sources are upserted by canonical URL, and items and arguments by content hash, so
 * re-running adds only new content. A run whose input files and import code match an earlier finished run
 * is skipped (keyed by a fingerprint in ingestion_runs.scope), which keeps unchanged deploys fast. New rows land as `draft` for admin review (TRD v2 §6) and an
 * existing row's status is never changed. Rejected items are skipped.
 *
 * Usage: DATABASE_URL=... npm run seed:verified [-- data/oregon-2026/verified]
 */
import { createHash } from "node:crypto";
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
  endorsementHash,
  outletSlateSchema,
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

// Fingerprint of every input file plus the import code, so an unchanged deploy can skip the import.
const fingerprint = createHash("sha256");
for (const f of ["scripts/import-verified.ts", "lib/seed/verified.ts"]) fingerprint.update(await readFile(f, "utf8"));
async function readJson(path: string): Promise<unknown> {
  const text = await readFile(path, "utf8");
  fingerprint.update(`${path}\0${text}\0`);
  return JSON.parse(text);
}

async function readAll<T>(sub: string, parse: (v: unknown) => T): Promise<T[]> {
  const files = (await readdir(join(dir, sub))).filter((f) => f.endsWith(".json")).sort();
  const raw = [];
  for (const f of files) raw.push(await readJson(join(dir, sub, f)));
  return raw.map(parse);
}

const candidates = await readAll("candidates", (v) => verifiedCandidateSchema.parse(v));
const measures = await readAll("measures", (v) => verifiedMeasureSchema.parse(v));
const outletDir = join(dir, "..", "endorsements", "outlets");
const slates = await readdir(outletDir)
  .then(async (files) => {
    const raw = [];
    for (const f of files.filter((f) => f.endsWith(".json")).sort()) raw.push(await readJson(join(outletDir, f)));
    return raw.map((v) => outletSlateSchema.parse(v));
  })
  .catch((e: NodeJS.ErrnoException) => {
    if (e.code === "ENOENT") return [];
    throw e;
  });

const pool = new Pool({ connectionString: url, max: 1 });
const db = drizzle(pool, { schema });
const scope = `verified:${dir}:${fingerprint.digest("hex").slice(0, 16)}`;
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const stats = {
  candidates: 0,
  measures: 0,
  sources: 0,
  items: 0,
  arguments: 0,
  endorsements: 0,
  skippedMissing: 0,
};
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

type EndorsementRow = Omit<typeof schema.endorsements.$inferInsert, "id" | "status">;

async function addEndorsement(tx: Tx, row: EndorsementRow, v?: VerifiedItem["verification"]) {
  const [inserted] = await tx
    .insert(schema.endorsements)
    .values(row)
    .onConflictDoNothing()
    .returning({ id: schema.endorsements.id });
  if (!inserted) return;
  stats.endorsements++;
  if (v) await recordVerification(tx, "endorsement", inserted.id, v);
}

const [done] = await db
  .select({ id: schema.ingestionRuns.id })
  .from(schema.ingestionRuns)
  .where(eq(schema.ingestionRuns.scope, scope))
  .limit(1);
if (done) {
  console.log(`verified import: skipped, ${scope} already imported`);
  await pool.end();
  process.exit(0);
}

try {
  await db.transaction(async (tx) => {
    const measureIds = new Map<string, string>();
    const candidateIds = new Map<string, string>();
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
      measureIds.set(m.id, row.id);
      for (const e of usable(m.endorsements)) {
        await addEndorsement(
          tx,
          {
            measureId: row.id,
            side: e.side,
            endorser: e.endorser,
            endorserType: e.endorser_type,
            statement: e.statement,
            excerpt: e.excerpt ?? null,
            sourceId: await sourceId(tx, e.source),
            contentHash: endorsementHash(`measure:${m.id}:${e.side}`, e, e.source.url),
          },
          e.verification,
        );
      }
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
      candidateIds.set(c.id, row.id);
      for (const e of usable(c.endorsements)) {
        await addEndorsement(
          tx,
          {
            candidateId: row.id,
            endorser: e.endorser,
            endorserType: e.endorser_type,
            statement: e.statement,
            excerpt: e.excerpt ?? null,
            sourceId: await sourceId(tx, e.source),
            contentHash: endorsementHash(`candidate:${c.id}`, e, e.source.url),
          },
          e.verification,
        );
      }
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

    // Outlet slates were verified as a whole (see their reports/), so they carry no per-row verification.
    const lookup = async (table: typeof schema.candidates | typeof schema.ballotMeasures, slug: string) =>
      (await tx.select({ id: table.id }).from(table).where(eq(table.slug, slug)))[0]?.id;
    for (const slate of slates) {
      for (const e of slate.endorsements) {
        const source = {
          url: e.source,
          publisher: slate.outlet,
          tier: "T3" as const,
          published_at: e.date ?? null,
          retrieved_at: null,
        };
        const base = {
          endorser: e.endorser,
          endorserType: e.endorser_type,
          rank: e.rank ?? null,
          statement: e.statement,
          excerpt: e.excerpt ?? null,
          endorsedOn: e.date && /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date : null,
        };
        if (e.pick === "candidate" && e.candidate_id) {
          const id = candidateIds.get(e.candidate_id) ?? (await lookup(schema.candidates, e.candidate_id));
          if (!id) {
            stats.skippedMissing++;
            continue;
          }
          await addEndorsement(tx, {
            ...base,
            candidateId: id,
            sourceId: await sourceId(tx, source),
            contentHash: endorsementHash(`candidate:${e.candidate_id}`, e, e.source),
          });
        } else if ((e.pick === "yes" || e.pick === "no") && e.measure_id) {
          const id = measureIds.get(e.measure_id) ?? (await lookup(schema.ballotMeasures, e.measure_id));
          if (!id) {
            stats.skippedMissing++;
            continue;
          }
          await addEndorsement(tx, {
            ...base,
            measureId: id,
            side: e.pick,
            sourceId: await sourceId(tx, source),
            contentHash: endorsementHash(`measure:${e.measure_id}:${e.pick}`, e, e.source),
          });
        }
      }
    }

    await tx.insert(schema.ingestionRuns).values({ scope, finishedAt: new Date(), stats });
  });
  console.log("verified import:", stats);
} finally {
  await pool.end();
}
