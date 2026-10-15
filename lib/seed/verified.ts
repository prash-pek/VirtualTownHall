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

export const verifiedCandidateSchema = z.looseObject({
  id: z.string(),
  race_id: z.string(),
  occupation: z.string().nullish(),
  website_url: z.url().nullish(),
  bio: z.array(item).default([]),
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
  gaps: z.array(z.string()).default([]),
});

export type VerifiedItem = z.infer<typeof item>;
export type VerifiedCandidate = z.infer<typeof verifiedCandidateSchema>;
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

/** Identity of a content row, so re-running the import doesn't duplicate it. */
export function contentHash(i: Pick<VerifiedItem, "statement" | "excerpt" | "source">): string {
  return createHash("sha256")
    .update([i.statement, i.excerpt ?? "", canonicalUrl(i.source.url)].join("\u0000"))
    .digest("hex");
}
