/**
 * What data/oregon-2026/verified/** says the database should hold, worked out in memory with no
 * database access. The importer writes this plan in a few batched queries, and the import check
 * (lib/seed/check.ts) compares the database against the same plan.
 */
import {
  canonicalUrl,
  contentHash,
  endorsementHash,
  usable,
  type VerifiedCandidate,
  type VerifiedIssueSweep,
  type VerifiedItem,
  type VerifiedMeasure,
} from "./verified";
import type { outletSlateSchema, PamphletHeadlines } from "./verified";
import type { PamphletBackground } from "../db/schema";
import type { z } from "zod";

type OutletSlate = z.infer<typeof outletSlateSchema>;
type Verification = VerifiedItem["verification"];

export type PlannedSource = {
  url: string;
  canonicalUrl: string;
  publisher: string | null;
  tier: "T1" | "T2" | "T3";
  publishedAt: string | null;
  retrievedAt: Date | null;
};

export type PlannedCandidateFields = {
  occupation: string | null;
  websiteUrl: string | null;
  officialUrl: string | null;
  pamphletUrl: string | null;
  gaps: string[];
};

export type PlannedMeasureFields = {
  ballotLabel: string | null;
  summary: string | null;
  yesMeans: string | null;
  noMeans: string | null;
  fiscalImpact: string | null;
  fullTextUrl: string | null;
  gaps: string[];
};

export type PlannedItem = {
  candidateSlug: string;
  kind: "bio" | "position" | "voting_record";
  topic: string | null;
  statement: string;
  excerpt: string | null;
  source: string;
  contentHash: string;
  verification: Verification;
};

export type PlannedArgument = {
  measureSlug: string;
  side: "yes" | "no";
  kind: "argument" | "rebuttal" | "explainer";
  author: string | null;
  topic: string | null;
  statement: string;
  excerpt: string | null;
  source: string;
  contentHash: string;
  verification: Verification;
};

export type PlannedEndorsement = {
  candidateSlug: string | null;
  measureSlug: string | null;
  side: "yes" | "no" | null;
  endorser: string;
  endorserType: string;
  rank: number | null;
  statement: string;
  excerpt: string | null;
  endorsedOn: string | null;
  source: string;
  contentHash: string;
  /** Outlet slates were verified as a whole (see their reports/), so they carry no per-row verification. */
  verification?: Verification;
};

export type VerifiedPlan = {
  /** Keyed by canonical URL; the first record that cites a URL sets its publisher and tier. */
  sources: Map<string, PlannedSource>;
  candidates: { slug: string; fields: PlannedCandidateFields }[];
  measures: { slug: string; fields: PlannedMeasureFields }[];
  items: PlannedItem[];
  arguments: PlannedArgument[];
  endorsements: PlannedEndorsement[];
  /** Pamphlet background lines per candidate; null means no pamphlet statement was found. */
  backgrounds: { slug: string; background: PamphletBackground | null }[];
};

/** The headlines file (snake_case, nulls) as stored on the candidate row (camelCase, empty fields left out). */
export function toBackground(h: PamphletHeadlines["candidates"][string]): PamphletBackground {
  const b: PamphletBackground = { source: h.source };
  if (h.occupation) b.occupation = h.occupation;
  if (h.occupational_background) b.occupationalBackground = h.occupational_background;
  if (h.educational_background) b.educationalBackground = h.educational_background;
  if (h.prior_governmental_experience) b.priorGovernmentalExperience = h.prior_governmental_experience;
  if (h.other?.length) b.other = h.other;
  return b;
}

const isoDate = (d: string | null | undefined) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null);

/**
 * Builds the plan in the order the old row-by-row importer walked the files (measures, candidates,
 * issue sweeps, outlet slates), so which record "wins" a shared source or a duplicate item is unchanged.
 * Rejected items are left out. A duplicate (same subject, same content hash) keeps its first occurrence.
 */
export function planVerified(input: {
  candidates: VerifiedCandidate[];
  measures: VerifiedMeasure[];
  sweeps: VerifiedIssueSweep[];
  slates: OutletSlate[];
  headlines?: PamphletHeadlines;
}): VerifiedPlan {
  const plan: VerifiedPlan = {
    sources: new Map(),
    candidates: [],
    measures: [],
    items: [],
    arguments: [],
    endorsements: [],
    backgrounds: [],
  };
  const seen = new Set<string>();
  const once = (key: string) => (seen.has(key) ? false : (seen.add(key), true));

  const source = (s: VerifiedItem["source"]): string => {
    const key = canonicalUrl(s.url);
    if (!plan.sources.has(key))
      plan.sources.set(key, {
        url: s.url,
        canonicalUrl: key,
        publisher: s.publisher ?? null,
        tier: s.tier,
        publishedAt: isoDate(s.published_at),
        retrievedAt: s.retrieved_at ? new Date(s.retrieved_at) : null,
      });
    return key;
  };

  const addItems = (candidateSlug: string, groups: (readonly [PlannedItem["kind"], VerifiedItem[]])[]) => {
    for (const [kind, items] of groups)
      for (const i of usable(items)) {
        const hash = contentHash(i);
        const src = source(i.source);
        if (!once(`item\0${candidateSlug}\0${hash}`)) continue;
        plan.items.push({
          candidateSlug,
          kind,
          topic: i.topic ?? null,
          statement: i.statement,
          excerpt: i.excerpt ?? null,
          source: src,
          contentHash: hash,
          verification: i.verification,
        });
      }
  };

  const addEndorsement = (e: PlannedEndorsement) => {
    if (once(`endorsement\0${e.contentHash}`)) plan.endorsements.push(e);
  };

  for (const m of input.measures) {
    plan.measures.push({
      slug: m.id,
      fields: {
        ballotLabel: m.ballot_label ?? null,
        summary: m.summary ?? null,
        yesMeans: m.yes_means ?? null,
        noMeans: m.no_means ?? null,
        fiscalImpact: m.fiscal_impact ?? null,
        fullTextUrl: m.full_text_url ?? null,
        gaps: m.gaps,
      },
    });
    for (const e of usable(m.endorsements))
      addEndorsement({
        candidateSlug: null,
        measureSlug: m.id,
        side: e.side,
        endorser: e.endorser,
        endorserType: e.endorser_type,
        rank: null,
        statement: e.statement,
        excerpt: e.excerpt ?? null,
        endorsedOn: null,
        source: source(e.source),
        contentHash: endorsementHash(`measure:${m.id}:${e.side}`, e, e.source.url),
        verification: e.verification,
      });
    for (const a of usable(m.arguments)) {
      const hash = contentHash(a);
      const src = source(a.source);
      if (!once(`argument\0${m.id}\0${hash}`)) continue;
      plan.arguments.push({
        measureSlug: m.id,
        side: a.side,
        kind: a.kind,
        author: a.author ?? null,
        topic: a.topic ?? null,
        statement: a.statement,
        excerpt: a.excerpt ?? null,
        source: src,
        contentHash: hash,
        verification: a.verification,
      });
    }
  }

  for (const c of input.candidates) {
    plan.candidates.push({
      slug: c.id,
      fields: {
        occupation: c.occupation ?? null,
        websiteUrl: c.website_url ?? null,
        officialUrl: c.official_url ?? null,
        pamphletUrl: c.pamphlet_url ?? null,
        gaps: c.gaps,
      },
    });
    for (const e of usable(c.endorsements))
      addEndorsement({
        candidateSlug: c.id,
        measureSlug: null,
        side: null,
        endorser: e.endorser,
        endorserType: e.endorser_type,
        rank: null,
        statement: e.statement,
        excerpt: e.excerpt ?? null,
        endorsedOn: null,
        source: source(e.source),
        contentHash: endorsementHash(`candidate:${c.id}`, e, e.source.url),
        verification: e.verification,
      });
    addItems(c.id, [
      ["bio", c.bio],
      ["position", c.positions],
      ["voting_record", c.voting_record],
    ]);
  }

  // Weekly issue sweeps (ISSUE_SWEEP.md) add items to candidates.
  for (const s of input.sweeps)
    addItems(s.id, [
      ["position", s.positions],
      ["voting_record", s.voting_record],
    ]);

  for (const slate of input.slates)
    for (const e of slate.endorsements) {
      const src = { url: e.source, publisher: slate.outlet, tier: "T3" as const, published_at: e.date ?? null };
      const base = {
        endorser: e.endorser,
        endorserType: e.endorser_type,
        rank: e.rank ?? null,
        statement: e.statement,
        excerpt: e.excerpt ?? null,
        endorsedOn: isoDate(e.date),
      };
      if (e.pick === "candidate" && e.candidate_id)
        addEndorsement({
          ...base,
          candidateSlug: e.candidate_id,
          measureSlug: null,
          side: null,
          source: source(src),
          contentHash: endorsementHash(`candidate:${e.candidate_id}`, e, e.source),
        });
      else if ((e.pick === "yes" || e.pick === "no") && e.measure_id)
        addEndorsement({
          ...base,
          candidateSlug: null,
          measureSlug: e.measure_id,
          side: e.pick,
          source: source(src),
          contentHash: endorsementHash(`measure:${e.measure_id}:${e.pick}`, e, e.source),
        });
    }

  if (input.headlines) {
    for (const [slug, h] of Object.entries(input.headlines.candidates))
      plan.backgrounds.push({ slug, background: toBackground(h) });
    for (const slug of input.headlines.not_found) plan.backgrounds.push({ slug, background: null });
  }

  return plan;
}
