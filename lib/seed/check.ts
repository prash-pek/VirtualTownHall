/**
 * Import check: compares the database with the data files and lists every difference. Runs inside
 * each import (a mismatch rolls the import back) and on its own before every production build
 * (scripts/check-import.ts), so a deploy fails instead of going live on data that doesn't match.
 *
 * It checks that everything the files say should be there is there, with the same text and source.
 * Rows the files no longer mention are allowed (older imports stay, as reviewed history), and review
 * status is not compared, since publishing and rejecting happen in /ops.
 */
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import * as schema from "../db/schema";
import type { Inventory } from "./inventory";
import type { VerifiedPlan } from "./plan";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Queryable = PgDatabase<PgQueryResultHKT, typeof schema, any>;

/** Runs queries one after another (one connection can't run two at once) and keeps their result types. */
export async function inOrder<T extends readonly unknown[]>(
  queries: [...T],
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const out: unknown[] = [];
  for (const q of queries) out.push(await q);
  return out as { [K in keyof T]: Awaited<T[K]> };
}

/** Stop listing after this many, so a wholesale mismatch doesn't flood the build log. */
const MAX_PROBLEMS = 50;

class Problems {
  list: string[] = [];
  total = 0;
  add(p: string) {
    this.total++;
    if (this.list.length < MAX_PROBLEMS) this.list.push(p);
  }
  /** Compares named fields; null and undefined count as the same. */
  diff(what: string, expected: Record<string, unknown>, actual: Record<string, unknown>) {
    for (const [k, v] of Object.entries(expected)) {
      const a = actual[k];
      if (JSON.stringify(v ?? null) !== JSON.stringify(a ?? null))
        this.add(
          `${what}: ${k} is ${JSON.stringify(a ?? null)} in the database, ${JSON.stringify(v ?? null)} in the files`,
        );
    }
  }
  result(): string[] {
    return this.total > this.list.length ? [...this.list, `…and ${this.total - this.list.length} more`] : this.list;
  }
}

export async function checkInventory(db: Queryable, inv: Inventory): Promise<string[]> {
  const p = new Problems();
  const parent = alias(schema.jurisdictions, "parent");

  const [elections, jurisdictions, races, candidates, measures] = await inOrder([
    db
      .select({ slug: schema.elections.slug, name: schema.elections.name, date: schema.elections.date })
      .from(schema.elections),
    db
      .select({
        slug: schema.jurisdictions.slug,
        name: schema.jurisdictions.name,
        type: schema.jurisdictions.type,
        parent: parent.slug,
      })
      .from(schema.jurisdictions)
      .leftJoin(parent, eq(parent.id, schema.jurisdictions.parentId)),
    db
      .select({
        slug: schema.races.slug,
        election: schema.elections.slug,
        jurisdiction: schema.jurisdictions.slug,
        office: schema.races.office,
        district: schema.races.districtLabel,
        seats: schema.races.seats,
        partisan: schema.races.partisan,
        rankedChoice: schema.races.rankedChoice,
        ballotOrder: schema.races.ballotOrder,
      })
      .from(schema.races)
      .innerJoin(schema.elections, eq(schema.elections.id, schema.races.electionId))
      .innerJoin(schema.jurisdictions, eq(schema.jurisdictions.id, schema.races.jurisdictionId)),
    db
      .select({
        slug: schema.candidates.slug,
        race: schema.races.slug,
        name: schema.candidates.name,
        party: schema.candidates.party,
        incumbent: schema.candidates.incumbent,
        ballotOrder: schema.candidates.ballotOrder,
      })
      .from(schema.candidates)
      .innerJoin(schema.races, eq(schema.races.id, schema.candidates.raceId)),
    db
      .select({
        slug: schema.ballotMeasures.slug,
        election: schema.elections.slug,
        jurisdiction: schema.jurisdictions.slug,
        number: schema.ballotMeasures.number,
        title: schema.ballotMeasures.title,
        ballotOrder: schema.ballotMeasures.ballotOrder,
      })
      .from(schema.ballotMeasures)
      .innerJoin(schema.elections, eq(schema.elections.id, schema.ballotMeasures.electionId))
      .innerJoin(schema.jurisdictions, eq(schema.jurisdictions.id, schema.ballotMeasures.jurisdictionId)),
  ]);

  const compare = <R extends { slug: string }>(
    kind: string,
    rows: R[],
    expected: { slug: string; fields: Record<string, unknown> }[],
  ) => {
    const bySlug = new Map(rows.map((r) => [r.slug, r]));
    for (const e of expected) {
      const row = bySlug.get(e.slug);
      if (!row) p.add(`${kind} ${e.slug} is missing from the database`);
      else p.diff(`${kind} ${e.slug}`, e.fields, row);
    }
  };

  const el = inv.election;
  compare("election", elections, [{ slug: el.id, fields: { name: el.name, date: el.date } }]);
  compare(
    "jurisdiction",
    jurisdictions,
    inv.jurisdictions.map((j) => ({ slug: j.id, fields: { name: j.name, type: j.type, parent: j.parent_id } })),
  );
  compare(
    "race",
    races,
    inv.races.map((r, i) => ({
      slug: r.id,
      fields: {
        election: el.id,
        jurisdiction: r.jurisdiction_id,
        office: r.office,
        district: r.district,
        seats: r.seats,
        partisan: r.partisan,
        rankedChoice: r.ranked_choice ?? false,
        ballotOrder: i + 1,
      },
    })),
  );
  const candidateOrder = new Map(inv.races.flatMap((r) => r.candidate_ids.map((c, i) => [c, i + 1] as const)));
  compare(
    "candidate",
    candidates,
    inv.candidates.map((c) => ({
      slug: c.id,
      fields: {
        race: c.race_id,
        name: c.name,
        party: c.party,
        incumbent: c.incumbent,
        ballotOrder: candidateOrder.get(c.id) ?? 0,
      },
    })),
  );
  compare(
    "measure",
    measures,
    inv.measures.map((m, i) => ({
      slug: m.id,
      fields: {
        election: el.id,
        jurisdiction: m.jurisdiction_id,
        number: m.number,
        title: m.title,
        ballotOrder: i + 1,
      },
    })),
  );
  return p.result();
}

export async function checkVerified(db: Queryable, plan: VerifiedPlan): Promise<string[]> {
  const p = new Problems();
  const c = schema.candidates;
  const m = schema.ballotMeasures;

  const [candidates, measures, items, args, endorsements] = await inOrder([
    db
      .select({
        slug: c.slug,
        occupation: c.occupation,
        websiteUrl: c.websiteUrl,
        officialUrl: c.officialUrl,
        pamphletUrl: c.pamphletUrl,
        gaps: c.gaps,
      })
      .from(c),
    db
      .select({
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
    db
      .select({
        candidate: c.slug,
        contentHash: schema.candidateItems.contentHash,
        statement: schema.candidateItems.statement,
        excerpt: schema.candidateItems.excerpt,
        source: schema.sources.canonicalUrl,
      })
      .from(schema.candidateItems)
      .innerJoin(c, eq(c.id, schema.candidateItems.candidateId))
      .leftJoin(schema.sources, eq(schema.sources.id, schema.candidateItems.sourceId)),
    db
      .select({
        measure: m.slug,
        contentHash: schema.measureArguments.contentHash,
        side: schema.measureArguments.side,
        statement: schema.measureArguments.statement,
        excerpt: schema.measureArguments.excerpt,
        source: schema.sources.canonicalUrl,
      })
      .from(schema.measureArguments)
      .innerJoin(m, eq(m.id, schema.measureArguments.measureId))
      .leftJoin(schema.sources, eq(schema.sources.id, schema.measureArguments.sourceId)),
    db
      .select({
        contentHash: schema.endorsements.contentHash,
        candidate: c.slug,
        measure: m.slug,
        side: schema.endorsements.side,
        endorser: schema.endorsements.endorser,
        statement: schema.endorsements.statement,
        excerpt: schema.endorsements.excerpt,
        source: schema.sources.canonicalUrl,
      })
      .from(schema.endorsements)
      .leftJoin(c, eq(c.id, schema.endorsements.candidateId))
      .leftJoin(m, eq(m.id, schema.endorsements.measureId))
      .leftJoin(schema.sources, eq(schema.sources.id, schema.endorsements.sourceId)),
  ]);

  const candidateBySlug = new Map(candidates.map((r) => [r.slug, r]));
  for (const e of plan.candidates) {
    const row = candidateBySlug.get(e.slug);
    if (!row)
      p.add(`candidate ${e.slug} has verified content but is not in the database (missing from inventory.json?)`);
    else p.diff(`candidate ${e.slug}`, e.fields, row);
  }
  const measureBySlug = new Map(measures.map((r) => [r.slug, r]));
  for (const e of plan.measures) {
    const row = measureBySlug.get(e.slug);
    if (!row) p.add(`measure ${e.slug} has verified content but is not in the database (missing from inventory.json?)`);
    else p.diff(`measure ${e.slug}`, e.fields, row);
  }

  const itemByKey = new Map(items.map((r) => [`${r.candidate}\0${r.contentHash}`, r]));
  for (const i of plan.items) {
    const what = `${i.kind} item for ${i.candidateSlug} ("${i.statement.slice(0, 60)}")`;
    if (!candidateBySlug.has(i.candidateSlug)) p.add(`${what}: candidate is not in the database`);
    const row = itemByKey.get(`${i.candidateSlug}\0${i.contentHash}`);
    if (!row) p.add(`${what} is missing from the database`);
    else p.diff(what, { statement: i.statement, excerpt: i.excerpt, source: i.source }, row);
  }

  const argByKey = new Map(args.map((r) => [`${r.measure}\0${r.contentHash}`, r]));
  for (const a of plan.arguments) {
    const what = `${a.side} ${a.kind} for ${a.measureSlug} ("${a.statement.slice(0, 60)}")`;
    const row = argByKey.get(`${a.measureSlug}\0${a.contentHash}`);
    if (!row) p.add(`${what} is missing from the database`);
    else p.diff(what, { side: a.side, statement: a.statement, excerpt: a.excerpt, source: a.source }, row);
  }

  const endorsementByHash = new Map(endorsements.map((r) => [r.contentHash, r]));
  for (const e of plan.endorsements) {
    const what = `endorsement by ${e.endorser} of ${e.candidateSlug ?? `${e.measureSlug} ${e.side}`}`;
    const row = endorsementByHash.get(e.contentHash);
    if (!row) p.add(`${what} is missing from the database`);
    else
      p.diff(
        what,
        {
          candidate: e.candidateSlug,
          measure: e.measureSlug,
          side: e.side,
          endorser: e.endorser,
          statement: e.statement,
          excerpt: e.excerpt,
          source: e.source,
        },
        row,
      );
  }
  return p.result();
}
