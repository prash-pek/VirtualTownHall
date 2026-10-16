import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { ballotMeasures, candidateItems, candidates, measureArguments, races, sources } from "@/lib/db/schema";

/**
 * Sourced content for one race or measure. Voters see only published rows (TRD v2 §6); admins can
 * preview drafts, which the page labels as not yet reviewed.
 */

export type SourcedItem = {
  statement: string;
  excerpt: string | null;
  sourceUrl: string | null;
  publisher: string | null;
  tier: string | null;
  draft: boolean;
};

export type CandidateProfile = {
  slug: string;
  name: string;
  party: string | null;
  incumbent: boolean | null;
  occupation: string | null;
  websiteUrl: string | null;
  claimed: boolean;
  draft: boolean;
  bio: SourcedItem[];
  positions: (SourcedItem & { topic: string | null })[];
  votingRecord: SourcedItem[];
};

export type MeasureArgument = SourcedItem & { side: "yes" | "no"; kind: string; author: string | null };

export type MeasureDetail = {
  draft: boolean;
  ballotLabel: string | null;
  summary: string | null;
  yesMeans: string | null;
  noMeans: string | null;
  fiscalImpact: string | null;
  fullTextUrl: string | null;
  arguments: MeasureArgument[];
};

/** Hidden (rejected) items never show, even in an admin preview. */
const visible = (status: string, preview: boolean) => status === "published" || (preview && status !== "rejected");

export async function getRaceProfiles(raceSlug: string, preview: boolean): Promise<CandidateProfile[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: candidates.id,
      slug: candidates.slug,
      name: candidates.name,
      party: candidates.party,
      incumbent: candidates.incumbent,
      occupation: candidates.occupation,
      websiteUrl: candidates.websiteUrl,
      profileSource: candidates.profileSource,
      isVerified: candidates.isVerified,
      status: candidates.status,
    })
    .from(candidates)
    .innerJoin(races, eq(candidates.raceId, races.id))
    .where(eq(races.slug, raceSlug))
    .orderBy(asc(candidates.ballotOrder));
  const shown = rows.filter((c) => visible(c.status, preview));
  const items = shown.length
    ? await db
        .select({
          candidateId: candidateItems.candidateId,
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
        .where(
          and(
            inArray(
              candidateItems.candidateId,
              shown.map((c) => c.id),
            ),
            eq(candidateItems.isActive, true),
          ),
        )
        .orderBy(asc(candidateItems.createdAt))
    : [];
  const byCandidate = Map.groupBy(
    items.filter((i) => visible(i.status, preview)),
    (i) => i.candidateId,
  );
  return rows.map((c) => {
    const own = shown.includes(c) ? (byCandidate.get(c.id) ?? []) : [];
    const toItem = (i: (typeof own)[number]) => ({
      statement: i.statement,
      excerpt: i.excerpt,
      sourceUrl: i.sourceUrl,
      publisher: i.publisher,
      tier: i.tier,
      draft: i.status !== "published",
    });
    return {
      slug: c.slug,
      name: c.name,
      party: c.party,
      incumbent: c.incumbent,
      occupation: shown.includes(c) ? c.occupation : null,
      websiteUrl: shown.includes(c) ? c.websiteUrl : null,
      claimed: c.profileSource === "candidate" && c.isVerified,
      draft: c.status !== "published",
      bio: own.filter((i) => i.kind === "bio").map(toItem),
      positions: own.filter((i) => i.kind === "position").map((i) => ({ ...toItem(i), topic: i.topic })),
      votingRecord: own.filter((i) => i.kind === "voting_record").map(toItem),
    };
  });
}

export async function getMeasureDetail(slug: string, preview: boolean): Promise<MeasureDetail | null> {
  const db = getDb();
  const [m] = await db.select().from(ballotMeasures).where(eq(ballotMeasures.slug, slug));
  if (!m || !visible(m.status, preview)) return null;
  const args = await db
    .select({
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
    .orderBy(asc(measureArguments.createdAt));
  return {
    draft: m.status !== "published",
    ballotLabel: m.ballotLabel,
    summary: m.summary,
    yesMeans: m.yesMeans,
    noMeans: m.noMeans,
    fiscalImpact: m.fiscalImpact,
    fullTextUrl: m.fullTextUrl,
    arguments: args
      .filter((a) => visible(a.status, preview))
      .map(({ status, ...a }) => ({ ...a, draft: status !== "published" })),
  };
}
