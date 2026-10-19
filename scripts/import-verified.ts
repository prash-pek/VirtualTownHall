/**
 * Imports data/oregon-2026/verified/** (candidate items, measure text and arguments, endorsements,
 * their sources and verification notes). Run after seed:inventory, which creates the candidates and
 * measures.
 *
 * Idempotent: sources are keyed by canonical URL, items and arguments by content hash per subject,
 * and endorsements by content hash, so re-running adds only new content. New rows land as `draft`
 * for admin review (TRD v2 §6) and an existing row's status is never changed. Rejected items are skipped.
 *
 * Batched: it reads what the database already holds in a few queries, then writes only new or changed
 * rows a few hundred at a time (the build machine is far from the database, so each round trip costs).
 * Before committing it runs the import check (lib/seed/check.ts); any mismatch rolls the whole import
 * back. A run whose input files and import code match an earlier finished run is skipped.
 *
 * Usage: DATABASE_URL=... npm run seed:verified [-- data/oregon-2026/verified]
 */
import { eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { databaseUrlUnpooled } from "../lib/env";
import * as schema from "../lib/db/schema";
import { checkVerified, inOrder } from "../lib/seed/check";
import { loadVerified } from "../lib/seed/load";
import type { PlannedCandidateFields, PlannedMeasureFields } from "../lib/seed/plan";
import type { VerifiedItem } from "../lib/seed/verified";

const dir = process.argv[2] ?? "data/oregon-2026/verified";
const url = databaseUrlUnpooled();
if (!url) {
  console.error("No database URL is set (DATABASE_URL or STORAGE1_DATABASE_URL)");
  process.exit(1);
}

const { plan, fingerprint } = await loadVerified(dir);
const pool = new Pool({ connectionString: url, max: 1 });
const db = drizzle(pool, { schema });
const scope = `verified:${dir}:${fingerprint}`;

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

/** Rows per statement: well under Postgres's 65,535-parameter limit for the widest table here. */
const BATCH = 500;
const chunks = <T>(rows: T[]): T[][] =>
  Array.from({ length: Math.ceil(rows.length / BATCH) }, (_, i) => rows.slice(i * BATCH, (i + 1) * BATCH));
const same = (want: object, row: object) =>
  Object.entries(want).every(
    ([k, v]) => JSON.stringify(v ?? null) === JSON.stringify((row as Record<string, unknown>)[k] ?? null),
  );
const verification = (subjectType: string, subjectId: string, v: VerifiedItem["verification"]) => ({
  subjectType,
  subjectId,
  status: v.status,
  checksFailed: v.checks_failed,
  note: v.note ?? null,
  verifier: "agent" as const,
});

const stats = {
  candidates: 0,
  measures: 0,
  sources: 0,
  items: 0,
  arguments: 0,
  endorsements: 0,
  skippedMissing: 0,
};

try {
  await db.transaction(async (tx) => {
    // 1. What's already there.
    const c = schema.candidates;
    const m = schema.ballotMeasures;
    const [candidateRows, measureRows, haveItems, haveArgs, haveEndorsements] = await inOrder([
      tx
        .select({
          id: c.id,
          slug: c.slug,
          occupation: c.occupation,
          websiteUrl: c.websiteUrl,
          officialUrl: c.officialUrl,
          pamphletUrl: c.pamphletUrl,
          gaps: c.gaps,
        })
        .from(c),
      tx
        .select({
          id: m.id,
          slug: m.slug,
          ballotLabel: m.ballotLabel,
          summary: m.summary,
          yesMeans: m.yesMeans,
          noMeans: m.noMeans,
          fiscalImpact: m.fiscalImpact,
          fullTextUrl: m.fullTextUrl,
          gaps: m.gaps,
        })
        .from(m),
      tx
        .select({ s: schema.candidateItems.candidateId, h: schema.candidateItems.contentHash })
        .from(schema.candidateItems),
      tx
        .select({ s: schema.measureArguments.measureId, h: schema.measureArguments.contentHash })
        .from(schema.measureArguments),
      tx.select({ h: schema.endorsements.contentHash }).from(schema.endorsements),
    ]);
    const candidateId = new Map(candidateRows.map((r) => [r.slug, r.id]));
    const measureId = new Map(measureRows.map((r) => [r.slug, r.id]));

    // Content for a candidate or measure that isn't in the database can't be imported; the check below fails on it.
    const warned = new Set<string>();
    const present = (kind: "candidate" | "measure", slug: string) => {
      if ((kind === "candidate" ? candidateId : measureId).has(slug)) return true;
      stats.skippedMissing++;
      if (!warned.has(`${kind}:${slug}`))
        console.warn(`${kind} ${slug} is not in the database; run seed:inventory first`);
      warned.add(`${kind}:${slug}`);
      return false;
    };

    // 2. Candidate and measure fields: update only rows that differ, one statement per batch.
    const candidateUpdates: (PlannedCandidateFields & { id: string })[] = [];
    for (const p of plan.candidates) {
      const row = candidateRows.find((r) => r.slug === p.slug);
      if (!present("candidate", p.slug) || !row) continue;
      stats.candidates++;
      if (!same(p.fields, row)) candidateUpdates.push({ id: row.id, ...p.fields });
    }
    const measureUpdates: (PlannedMeasureFields & { id: string })[] = [];
    for (const p of plan.measures) {
      const row = measureRows.find((r) => r.slug === p.slug);
      if (!present("measure", p.slug) || !row) continue;
      stats.measures++;
      if (!same(p.fields, row)) measureUpdates.push({ id: row.id, ...p.fields });
    }
    for (const rows of chunks(candidateUpdates))
      await tx.execute(sql`
        update candidates c
        set occupation = v.occupation, website_url = v."websiteUrl", official_url = v."officialUrl",
            pamphlet_url = v."pamphletUrl", gaps = v.gaps, updated_at = now()
        from jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
          as v(id uuid, occupation text, "websiteUrl" text, "officialUrl" text, "pamphletUrl" text, gaps text[])
        where c.id = v.id`);
    for (const rows of chunks(measureUpdates))
      await tx.execute(sql`
        update ballot_measures m
        set ballot_label = v."ballotLabel", summary = v.summary, yes_means = v."yesMeans", no_means = v."noMeans",
            fiscal_impact = v."fiscalImpact", full_text_url = v."fullTextUrl", gaps = v.gaps, updated_at = now()
        from jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
          as v(id uuid, "ballotLabel" text, summary text, "yesMeans" text, "noMeans" text, "fiscalImpact" text,
               "fullTextUrl" text, gaps text[])
        where m.id = v.id`);

    // 3. Which content is new. Same identity as before: content hash per candidate or measure.
    const has = new Set([...haveItems, ...haveArgs].map((r) => `${r.s}\0${r.h}`));
    const hasEndorsement = new Set(haveEndorsements.map((r) => r.h));
    const items = plan.items.filter((i) => present("candidate", i.candidateSlug));
    const args = plan.arguments.filter((a) => present("measure", a.measureSlug));
    const endorsements = plan.endorsements.filter((e) =>
      e.candidateSlug ? present("candidate", e.candidateSlug) : present("measure", e.measureSlug!),
    );
    const newItems = items.filter((i) => !has.has(`${candidateId.get(i.candidateSlug)}\0${i.contentHash}`));
    const newArgs = args.filter((a) => !has.has(`${measureId.get(a.measureSlug)}\0${a.contentHash}`));
    const newEndorsements = endorsements.filter((e) => !hasEndorsement.has(e.contentHash));

    // 4. Sources the content cites. An existing source is left as it is; a new one takes the
    // publisher and tier of the first record citing it (plan order).
    const cited = new Set([...items, ...args, ...endorsements].map((r) => r.source));
    const wanted = [...plan.sources.values()].filter((s) => cited.has(s.canonicalUrl));
    const sourceId = new Map<string, string>();
    for (const keys of chunks(wanted.map((s) => s.canonicalUrl))) {
      const rows = await tx
        .select({ id: schema.sources.id, key: schema.sources.canonicalUrl })
        .from(schema.sources)
        .where(inArray(schema.sources.canonicalUrl, keys));
      for (const r of rows) sourceId.set(r.key, r.id);
    }
    for (const rows of chunks(wanted.filter((s) => !sourceId.has(s.canonicalUrl)))) {
      const inserted = await tx
        .insert(schema.sources)
        .values(rows)
        .onConflictDoNothing()
        .returning({ id: schema.sources.id, key: schema.sources.canonicalUrl });
      for (const r of inserted) sourceId.set(r.key, r.id);
      stats.sources += inserted.length;
    }
    const src = (key: string) => {
      const id = sourceId.get(key);
      if (!id) throw new Error(`source ${key} was not created`);
      return id;
    };

    // 5. New items, arguments and endorsements, then their verification notes.
    const verifications: ReturnType<typeof verification>[] = [];
    for (const rows of chunks(newItems)) {
      const inserted = await tx
        .insert(schema.candidateItems)
        .values(
          rows.map((i) => ({
            candidateId: candidateId.get(i.candidateSlug)!,
            kind: i.kind,
            topic: i.topic,
            statement: i.statement,
            excerpt: i.excerpt,
            sourceId: src(i.source),
            contentHash: i.contentHash,
          })),
        )
        .onConflictDoNothing()
        .returning({
          id: schema.candidateItems.id,
          s: schema.candidateItems.candidateId,
          h: schema.candidateItems.contentHash,
        });
      const byKey = new Map(rows.map((i) => [`${candidateId.get(i.candidateSlug)}\0${i.contentHash}`, i]));
      for (const r of inserted)
        verifications.push(verification("candidate_item", r.id, byKey.get(`${r.s}\0${r.h}`)!.verification));
      stats.items += inserted.length;
    }
    for (const rows of chunks(newArgs)) {
      const inserted = await tx
        .insert(schema.measureArguments)
        .values(
          rows.map((a) => ({
            measureId: measureId.get(a.measureSlug)!,
            side: a.side,
            kind: a.kind,
            author: a.author,
            topic: a.topic,
            statement: a.statement,
            excerpt: a.excerpt,
            sourceId: src(a.source),
            contentHash: a.contentHash,
          })),
        )
        .onConflictDoNothing()
        .returning({
          id: schema.measureArguments.id,
          s: schema.measureArguments.measureId,
          h: schema.measureArguments.contentHash,
        });
      const byKey = new Map(rows.map((a) => [`${measureId.get(a.measureSlug)}\0${a.contentHash}`, a]));
      for (const r of inserted)
        verifications.push(verification("measure_argument", r.id, byKey.get(`${r.s}\0${r.h}`)!.verification));
      stats.arguments += inserted.length;
    }
    for (const rows of chunks(newEndorsements)) {
      const inserted = await tx
        .insert(schema.endorsements)
        .values(
          rows.map((e) => ({
            candidateId: e.candidateSlug ? candidateId.get(e.candidateSlug)! : null,
            measureId: e.measureSlug ? measureId.get(e.measureSlug)! : null,
            side: e.side,
            endorser: e.endorser,
            endorserType: e.endorserType,
            rank: e.rank,
            statement: e.statement,
            excerpt: e.excerpt,
            endorsedOn: e.endorsedOn,
            sourceId: src(e.source),
            contentHash: e.contentHash,
          })),
        )
        .onConflictDoNothing()
        .returning({ id: schema.endorsements.id, h: schema.endorsements.contentHash });
      const byHash = new Map(rows.map((e) => [e.contentHash, e]));
      for (const r of inserted) {
        const v = byHash.get(r.h)!.verification;
        if (v) verifications.push(verification("endorsement", r.id, v));
      }
      stats.endorsements += inserted.length;
    }
    for (const rows of chunks(verifications)) await tx.insert(schema.verifications).values(rows);

    // 6. The database must now match the files, or nothing is committed.
    const problems = await checkVerified(tx, plan);
    if (problems.length)
      throw new Error(`verified import: the database doesn't match the files, rolling back:\n${problems.join("\n")}`);

    await tx.insert(schema.ingestionRuns).values({ scope, finishedAt: new Date(), stats });
  });
  console.log("verified import:", stats);
} finally {
  await pool.end();
}
