/**
 * Shape of data/oregon-2026/verified/** (see data/oregon-2026/README.md) and the pure helpers the
 * importer uses. Objects are loose so fields added by the data pipeline don't break the import.
 */
import { createHash } from "node:crypto";

import { z } from "zod";

const source = z.looseObject({
  url: z.url(),
  publisher: z.string().nullish(),
  tier: z.enum(["T1", "T2", "T3"]),
  published_at: z.string().nullish(),
  retrieved_at: z.string().nullish(),
});

const verification = z.looseObject({
  status: z.enum(["verified", "corrected", "rejected"]),
  checks_failed: z.array(z.string()).default([]),
  note: z.string().nullish(),
});

const item = z.looseObject({
  id: z.string(),
  topic: z.string().nullish(),
  statement: z.string().min(1),
  excerpt: z.string().nullish(),
  source,
  verification,
});

/** A pamphlet-listed endorser on a candidate or measure record. */
const endorsement = z.looseObject({
  id: z.string(),
  endorser: z.string().min(1),
  endorser_type: z.string().min(1),
  statement: z.string().min(1),
  excerpt: z.string().nullish(),
  source,
  verification,
});

export const verifiedCandidateSchema = z.looseObject({
  id: z.string(),
  race_id: z.string(),
  occupation: z.string().nullish(),
  website_url: z.url().nullish(),
  official_url: z.url().nullish(),
  pamphlet_url: z.url().nullish(),
  bio: z.array(item).default([]),
  positions: z.array(item).default([]),
  voting_record: z.array(item).default([]),
  endorsements: z.array(endorsement).default([]),
  gaps: z.array(z.string()).default([]),
});

/** data/oregon-2026/pamphlet-headlines.json (pipeline/pamphlet_headlines.py). */
export const pamphletHeadlinesSchema = z.looseObject({
  candidates: z.record(
    z.string(),
    z.looseObject({
      occupation: z.string().nullish(),
      occupational_background: z.string().nullish(),
      educational_background: z.string().nullish(),
      prior_governmental_experience: z.string().nullish(),
      other: z.array(z.object({ label: z.string(), text: z.string() })).nullish(),
      source: z.object({ title: z.string(), url: z.url(), page: z.number().int() }),
    }),
  ),
  not_found: z.array(z.string()).default([]),
});
export type PamphletHeadlines = z.infer<typeof pamphletHeadlinesSchema>;

/** A candidate's weekly issue sweeps (data/oregon-2026/verified/issues/<id>.json, see ISSUE_SWEEP.md). */
export const verifiedIssueSweepSchema = z.looseObject({
  id: z.string(),
  race_id: z.string(),
  sweeps: z.array(z.string()).default([]),
  positions: z.array(item).default([]),
  voting_record: z.array(item).default([]),
  gaps: z.array(z.string()).default([]),
});

export const verifiedMeasureSchema = z.looseObject({
  id: z.string(),
  ballot_label: z.string().nullish(),
  summary: z.string().nullish(),
  yes_means: z.string().nullish(),
  no_means: z.string().nullish(),
  fiscal_impact: z.string().nullish(),
  full_text_url: z.url().nullish(),
  arguments: z.array(
    item.extend({
      side: z.enum(["yes", "no"]),
      kind: z.enum(["argument", "rebuttal", "explainer"]),
      author: z.string().nullish(),
    }),
  ),
  endorsements: z.array(endorsement.extend({ side: z.enum(["yes", "no"]) })).default([]),
  gaps: z.array(z.string()).default([]),
});

/** One outlet's endorsement slate (data/oregon-2026/endorsements/outlets/*.json), verified as a whole. */
export const outletSlateSchema = z.looseObject({
  outlet: z.string(),
  endorsements: z.array(
    z.looseObject({
      id: z.string(),
      endorser: z.string().min(1),
      endorser_type: z.string().min(1),
      race_id: z.string().nullish(),
      measure_id: z.string().nullish(),
      pick: z.enum(["candidate", "yes", "no", "none", "dual"]),
      candidate_id: z.string().nullish(),
      rank: z.number().int().nullish(),
      statement: z.string().min(1),
      excerpt: z.string().nullish(),
      source: z.url(),
      date: z.string().nullish(),
    }),
  ),
});

export type VerifiedEndorsement = z.infer<typeof endorsement>;
export type VerifiedItem = z.infer<typeof item>;
export type VerifiedCandidate = z.infer<typeof verifiedCandidateSchema>;
export type VerifiedIssueSweep = z.infer<typeof verifiedIssueSweepSchema>;
export type VerifiedMeasure = z.infer<typeof verifiedMeasureSchema>;

/** Items the verifier rejected never reach the database. */
export function usable<T extends VerifiedItem>(items: T[]): T[] {
  return items.filter((i) => i.verification.status !== "rejected");
}

/** Same page, same key: lowercase host, no fragment, no trailing slash. */
export function canonicalUrl(raw: string): string {
  const u = new URL(raw);
  u.hash = "";
  u.hostname = u.hostname.toLowerCase();
  const s = u.toString();
  return s.endsWith("/") && u.pathname !== "/" ? s.slice(0, -1) : s;
}

/** Identity of an endorsement: who, for which subject, saying what, where. */
export function endorsementHash(
  subject: string,
  e: { endorser: string; statement: string; excerpt?: string | null },
  url: string,
) {
  return createHash("sha256")
    .update([subject, e.endorser, e.statement, e.excerpt ?? "", canonicalUrl(url)].join("\u0000"))
    .digest("hex");
}

/** Identity of a content row, so re-running the import doesn't duplicate it. */
export function contentHash(i: Pick<VerifiedItem, "statement" | "excerpt" | "source">): string {
  return createHash("sha256")
    .update([i.statement, i.excerpt ?? "", canonicalUrl(i.source.url)].join("\u0000"))
    .digest("hex");
}
