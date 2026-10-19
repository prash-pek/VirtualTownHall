import "server-only";

import { and, asc, desc, eq, inArray, ne, sql } from "drizzle-orm";

import { appendAudit } from "@/lib/audit/log";
import { topicLabel } from "@/lib/ballot/issues";
import { getDb } from "@/lib/db/client";
import {
  ballotMeasures,
  candidateItems,
  endorsements,
  candidates,
  jurisdictions,
  measureArguments,
  races,
  sources,
  verifications,
} from "@/lib/db/schema";

/**
 * Admin review queue (TRD v2 §6, phase 3). A reviewer publishes a whole measure or candidate at once:
 * the subject and every item on it that isn't rejected. Single items can be rejected (hidden from
 * voters) or restored. Every change is written to the hash-chained audit log in the same transaction.
 */

export type QueueStatus = "draft" | "in_review" | "published" | "rejected" | "withdrawn";

export type QueueMeasure = {
  slug: string;
  number: string;
  title: string;
  jurisdiction: string;
  status: QueueStatus;
  yes: number;
  no: number;
  neutral: number;
};

export type QueueCandidate = {
  slug: string;
  name: string;
  status: QueueStatus;
  items: number;
  /** Items and endorsements still in draft, such as a weekly issue sweep added to a published candidate. */
  pending: number;
};

/** A race with the candidates that have content to review (or are already published). */
export type QueueRace = {
  slug: string;
  label: string;
  candidates: QueueCandidate[];
  /** Candidates in the race with no verified content yet; publishing the race leaves them alone. */
  withoutContent: number;
};

const reviewable = (c: { items: number; status: string }) => c.items > 0 || c.status === "published";

/** Draft items and endorsements on a candidate (new content waiting for review). */
const pendingSql = sql<number>`((select count(*)::int from ${candidateItems} ci where ci.candidate_id = ${candidates.id} and ci.status in ('draft', 'in_review')) + (select count(*)::int from ${endorsements} e where e.candidate_id = ${candidates.id} and e.status in ('draft', 'in_review')))`;

/** Whether publishing would change anything: a draft candidate, or a published one with new drafts. */
const needsPublish = (c: { status: string; pending: number }) => c.status !== "published" || c.pending > 0;

export async function getQueue() {
  const db = getDb();
  const [measureRows, argCounts, candidateRows] = await Promise.all([
    db
      .select({
        id: ballotMeasures.id,
        slug: ballotMeasures.slug,
        number: ballotMeasures.number,
        title: ballotMeasures.title,
        jurisdiction: jurisdictions.name,
        status: ballotMeasures.status,
      })
      .from(ballotMeasures)
      .innerJoin(jurisdictions, eq(ballotMeasures.jurisdictionId, jurisdictions.id))
      .orderBy(asc(ballotMeasures.ballotOrder)),
    db
      .select({
        measureId: measureArguments.measureId,
        side: measureArguments.side,
        kind: measureArguments.kind,
        n: sql<number>`count(*)::int`,
      })
      .from(measureArguments)
      .where(ne(measureArguments.status, "rejected"))
      .groupBy(measureArguments.measureId, measureArguments.side, measureArguments.kind),
    db
      .select({
        slug: candidates.slug,
        name: candidates.name,
        raceSlug: races.slug,
        office: races.office,
        districtLabel: races.districtLabel,
        status: candidates.status,
        items: sql<number>`(select count(*)::int from ${candidateItems} ci where ci.candidate_id = ${candidates.id} and ci.status <> 'rejected')`,
        pending: pendingSql,
      })
      .from(candidates)
      .innerJoin(races, eq(candidates.raceId, races.id))
      .orderBy(asc(races.ballotOrder), asc(candidates.ballotOrder)),
  ]);

  const measures: QueueMeasure[] = measureRows.map((m) => {
    const mine = argCounts.filter((a) => a.measureId === m.id);
    const count = (pred: (a: (typeof mine)[number]) => boolean) => mine.filter(pred).reduce((sum, a) => sum + a.n, 0);
    return {
      slug: m.slug,
      number: m.number,
      title: m.title,
      jurisdiction: m.jurisdiction,
      status: m.status,
      yes: count((a) => a.side === "yes" && a.kind !== "explainer"),
      no: count((a) => a.side === "no" && a.kind !== "explainer"),
      neutral: count((a) => a.kind === "explainer"),
    };
  });
  const byRace = new Map<string, QueueRace>();
  for (const c of candidateRows) {
    let race = byRace.get(c.raceSlug);
    if (!race) {
      race = {
        slug: c.raceSlug,
        label: [c.office, c.districtLabel].filter(Boolean).join(", "),
        candidates: [],
        withoutContent: 0,
      };
      byRace.set(c.raceSlug, race);
    }
    if (reviewable(c))
      race.candidates.push({ slug: c.slug, name: c.name, status: c.status, items: c.items, pending: c.pending });
    else race.withoutContent++;
  }
  const allRaces = [...byRace.values()];
  return {
    measures,
    races: allRaces.filter((r) => r.candidates.length > 0),
    candidatesWithoutContent: allRaces.reduce((sum, r) => sum + r.withoutContent, 0),
  };
}

export type ReviewItem = {
  id: string;
  label: string;
  statement: string;
  excerpt: string | null;
  sourceUrl: string | null;
  publisher: string | null;
  tier: string | null;
  status: QueueStatus;
  verification: string | null;
};

async function latestVerifications(subjectType: string, ids: string[]) {
  if (ids.length === 0) return new Map<string, string>();
  const rows = await getDb()
    .select({ subjectId: verifications.subjectId, status: verifications.status, note: verifications.note })
    .from(verifications)
    .where(and(eq(verifications.subjectType, subjectType), inArray(verifications.subjectId, ids)))
    .orderBy(desc(verifications.createdAt));
  const out = new Map<string, string>();
  for (const r of rows) if (!out.has(r.subjectId)) out.set(r.subjectId, r.note ? `${r.status}: ${r.note}` : r.status);
  return out;
}

async function endorsementReview(where: ReturnType<typeof eq>): Promise<ReviewItem[]> {
  const rows = await getDb()
    .select({
      id: endorsements.id,
      side: endorsements.side,
      endorser: endorsements.endorser,
      endorserType: endorsements.endorserType,
      statement: endorsements.statement,
      excerpt: endorsements.excerpt,
      status: endorsements.status,
      sourceUrl: sources.url,
      publisher: sources.publisher,
      tier: sources.tier,
    })
    .from(endorsements)
    .leftJoin(sources, eq(endorsements.sourceId, sources.id))
    .where(where)
    .orderBy(asc(endorsements.side), asc(endorsements.endorser));
  const checks = await latestVerifications(
    "endorsement",
    rows.map((r) => r.id),
  );
  return rows.map(({ side, endorser, endorserType, ...r }) => ({
    ...r,
    label: `Endorsed by ${endorser} (${endorserType})${side ? ` · ${side.toUpperCase()}` : ""}`,
    verification: checks.get(r.id) ?? null,
  }));
}

export async function getMeasureReview(slug: string) {
  const db = getDb();
  const [m] = await db.select().from(ballotMeasures).where(eq(ballotMeasures.slug, slug));
  if (!m) return null;
  const args = await db
    .select({
      id: measureArguments.id,
      side: measureArguments.side,
      kind: measureArguments.kind,
      author: measureArguments.author,
      statement: measureArguments.statement,
      excerpt: measureArguments.excerpt,
      status: measureArguments.status,
      sourceUrl: sources.url,
      publisher: sources.publisher,
      tier: sources.tier,
    })
    .from(measureArguments)
    .leftJoin(sources, eq(measureArguments.sourceId, sources.id))
    .where(eq(measureArguments.measureId, m.id))
    .orderBy(asc(measureArguments.side), asc(measureArguments.createdAt));
  const checks = await latestVerifications(
    "measure_argument",
    args.map((a) => a.id),
  );
  const items: ReviewItem[] = args.map((a) => ({
    ...a,
    label:
      a.kind === "explainer"
        ? "Neutral explanation"
        : `${a.side.toUpperCase()} ${a.kind}${a.author ? ` · ${a.author}` : ""}`,
    verification: checks.get(a.id) ?? null,
  }));
  return { measure: m, items, endorsements: await endorsementReview(eq(endorsements.measureId, m.id)) };
}

export async function getCandidateReview(slug: string) {
  const db = getDb();
  const [c] = await db
    .select({
      id: candidates.id,
      slug: candidates.slug,
      name: candidates.name,
      party: candidates.party,
      incumbent: candidates.incumbent,
      occupation: candidates.occupation,
      websiteUrl: candidates.websiteUrl,
      gaps: candidates.gaps,
      status: candidates.status,
      office: races.office,
      districtLabel: races.districtLabel,
      raceSlug: races.slug,
    })
    .from(candidates)
    .innerJoin(races, eq(candidates.raceId, races.id))
    .where(eq(candidates.slug, slug));
  if (!c) return null;
  const rows = await db
    .select({
      id: candidateItems.id,
      kind: candidateItems.kind,
      topic: candidateItems.topic,
      statement: candidateItems.statement,
      excerpt: candidateItems.excerpt,
      status: candidateItems.status,
      sourceUrl: sources.url,
      publisher: sources.publisher,
      tier: sources.tier,
    })
    .from(candidateItems)
    .leftJoin(sources, eq(candidateItems.sourceId, sources.id))
    .where(eq(candidateItems.candidateId, c.id))
    .orderBy(asc(candidateItems.kind), asc(candidateItems.createdAt));
  const checks = await latestVerifications(
    "candidate_item",
    rows.map((r) => r.id),
  );
  const items: ReviewItem[] = rows.map(({ kind, topic, ...r }) => ({
    ...r,
    label: [kind.replace("_", " "), topicLabel(topic)].filter(Boolean).join(" · "),
    verification: checks.get(r.id) ?? null,
  }));
  return { candidate: c, items, endorsements: await endorsementReview(eq(endorsements.candidateId, c.id)) };
}

export type SubjectKind = "measure" | "candidate";

/** Publish (or take back to draft) a measure or candidate together with its non-rejected items. */
export async function setSubjectPublished(kind: SubjectKind, slug: string, publish: boolean, actorId: string) {
  const db = getDb();
  await db.transaction(async (tx) => {
    const target = publish ? ("published" as const) : ("draft" as const);
    const from = publish ? (["draft", "in_review"] as const) : (["published"] as const);
    let subjectId: string | undefined;
    let changed: { id: string; contentHash: string }[];
    if (kind === "measure") {
      const [m] = await tx
        .update(ballotMeasures)
        .set({ status: target, updatedAt: sql`now()` })
        .where(eq(ballotMeasures.slug, slug))
        .returning({ id: ballotMeasures.id });
      subjectId = m?.id;
      if (!subjectId) return;
      changed = await tx
        .update(measureArguments)
        .set({ status: target, updatedAt: sql`now()` })
        .where(and(eq(measureArguments.measureId, subjectId), inArray(measureArguments.status, [...from])))
        .returning({ id: measureArguments.id, contentHash: measureArguments.contentHash });
      changed.push(
        ...(await tx
          .update(endorsements)
          .set({ status: target, updatedAt: sql`now()` })
          .where(and(eq(endorsements.measureId, subjectId), inArray(endorsements.status, [...from])))
          .returning({ id: endorsements.id, contentHash: endorsements.contentHash })),
      );
    } else {
      const [c] = await tx
        .update(candidates)
        .set({ status: target, updatedAt: sql`now()` })
        .where(eq(candidates.slug, slug))
        .returning({ id: candidates.id });
      subjectId = c?.id;
      if (!subjectId) return;
      changed = await tx
        .update(candidateItems)
        .set({ status: target, updatedAt: sql`now()` })
        .where(and(eq(candidateItems.candidateId, subjectId), inArray(candidateItems.status, [...from])))
        .returning({ id: candidateItems.id, contentHash: candidateItems.contentHash });
      changed.push(
        ...(await tx
          .update(endorsements)
          .set({ status: target, updatedAt: sql`now()` })
          .where(and(eq(endorsements.candidateId, subjectId), inArray(endorsements.status, [...from])))
          .returning({ id: endorsements.id, contentHash: endorsements.contentHash })),
      );
    }
    await appendAudit(tx, {
      subjectType: kind,
      subjectId,
      action: publish ? "publish" : "unpublish",
      actorId,
      payload: { slug, items: changed.map((r) => ({ id: r.id, contentHash: r.contentHash })) },
    });
  });
}

/**
 * Publishes (or unpublishes) every candidate in a race that has content to review. Each candidate is
 * its own transaction and audit entry, exactly as if published one by one. Returns how many changed.
 */
export async function setRacePublished(raceSlug: string, publish: boolean, actorId: string) {
  const rows = await getDb()
    .select({
      slug: candidates.slug,
      status: candidates.status,
      items: sql<number>`(select count(*)::int from ${candidateItems} ci where ci.candidate_id = ${candidates.id} and ci.status <> 'rejected')`,
      pending: pendingSql,
    })
    .from(candidates)
    .innerJoin(races, eq(candidates.raceId, races.id))
    .where(eq(races.slug, raceSlug))
    .orderBy(asc(candidates.ballotOrder));
  // Publishing also picks up a published candidate's new drafts (for example a weekly issue sweep).
  const todo = rows.filter((c) => reviewable(c) && (publish ? needsPublish(c) : c.status === "published"));
  for (const c of todo) await setSubjectPublished("candidate", c.slug, publish, actorId);
  return todo.length;
}

/** Publishes every draft measure and every candidate with content, one subject at a time (each audited). */
export async function publishEverything(actorId: string) {
  const db = getDb();
  const measureRows = await db
    .select({ slug: ballotMeasures.slug })
    .from(ballotMeasures)
    .where(inArray(ballotMeasures.status, ["draft", "in_review"]));
  for (const m of measureRows) await setSubjectPublished("measure", m.slug, true, actorId);
  const raceRows = await db.select({ slug: races.slug }).from(races);
  let candidatesPublished = 0;
  for (const r of raceRows) candidatesPublished += await setRacePublished(r.slug, true, actorId);
  return { measures: measureRows.length, candidates: candidatesPublished };
}

/** Hide one item from voters, or restore it to its subject's current state. */
export type ItemKind = SubjectKind | "endorsement";

export async function setItemRejected(kind: ItemKind, itemId: string, reject: boolean, actorId: string) {
  const db = getDb();
  await db.transaction(async (tx) => {
    let parentStatus: string | undefined;
    let contentHash: string | undefined;
    if (kind === "measure") {
      const [row] = await tx
        .select({ parent: ballotMeasures.status })
        .from(measureArguments)
        .innerJoin(ballotMeasures, eq(measureArguments.measureId, ballotMeasures.id))
        .where(eq(measureArguments.id, itemId));
      parentStatus = row?.parent;
      if (!parentStatus) return;
      const status = reject ? "rejected" : parentStatus === "published" ? "published" : "draft";
      [{ contentHash } = { contentHash: undefined }] = await tx
        .update(measureArguments)
        .set({ status, updatedAt: sql`now()` })
        .where(eq(measureArguments.id, itemId))
        .returning({ contentHash: measureArguments.contentHash });
    } else if (kind === "endorsement") {
      const [row] = await tx
        .select({ measure: ballotMeasures.status, candidate: candidates.status })
        .from(endorsements)
        .leftJoin(ballotMeasures, eq(endorsements.measureId, ballotMeasures.id))
        .leftJoin(candidates, eq(endorsements.candidateId, candidates.id))
        .where(eq(endorsements.id, itemId));
      parentStatus = row?.measure ?? row?.candidate ?? undefined;
      if (!parentStatus) return;
      const status = reject ? "rejected" : parentStatus === "published" ? "published" : "draft";
      [{ contentHash } = { contentHash: undefined }] = await tx
        .update(endorsements)
        .set({ status, updatedAt: sql`now()` })
        .where(eq(endorsements.id, itemId))
        .returning({ contentHash: endorsements.contentHash });
    } else {
      const [row] = await tx
        .select({ parent: candidates.status })
        .from(candidateItems)
        .innerJoin(candidates, eq(candidateItems.candidateId, candidates.id))
        .where(eq(candidateItems.id, itemId));
      parentStatus = row?.parent;
      if (!parentStatus) return;
      const status = reject ? "rejected" : parentStatus === "published" ? "published" : "draft";
      [{ contentHash } = { contentHash: undefined }] = await tx
        .update(candidateItems)
        .set({ status, updatedAt: sql`now()` })
        .where(eq(candidateItems.id, itemId))
        .returning({ contentHash: candidateItems.contentHash });
    }
    await appendAudit(tx, {
      subjectType: kind === "measure" ? "measure_argument" : kind === "candidate" ? "candidate_item" : "endorsement",
      subjectId: itemId,
      action: reject ? "reject" : "restore",
      actorId,
      payload: { contentHash: contentHash ?? null },
    });
  });
}
