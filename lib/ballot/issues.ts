import data from "@/data/oregon-2026/issues.json";

/**
 * The fixed issue list (data/oregon-2026/issues.json). Every candidate is swept on it each week
 * (data/oregon-2026/pipeline/ISSUE_SWEEP.md), the discussion tags each question with one of its ids, and
 * race pages offer the issues we have sources on as "Ask about" prompts.
 */
export type Issue = { id: string; label: string };

export const issues: Issue[] = data.issues.map(({ id, label }) => ({ id, label }));
const byId = new Map(issues.map((i) => [i.id, i]));

/** The voter-facing label for an item topic, or null for pipeline-only tags like "custom:bio". */
export function issueLabel(topic: string | null | undefined): string | null {
  return (topic && byId.get(topic)?.label) ?? null;
}

/**
 * A readable label for any topic tag, for /ops: the issue label when there is one, otherwise the tag without
 * its internal "custom:" or "other:" prefix ("custom:background" reads "Background").
 */
export function topicLabel(topic: string | null | undefined): string | null {
  if (!topic) return null;
  const known = issueLabel(topic);
  if (known) return known;
  const words = topic.replace(/^(custom|other)\s*:\s*/i, "").replace(/[-_]+/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : null;
}

/**
 * The issues a race has sources on, most widely covered first: how many candidates have something on it,
 * then how many items. Only issues at least one candidate has a published item on.
 */
export function topIssues(candidates: { topics: (string | null)[] }[], max = 6): Issue[] {
  const tally = new Map<string, { people: number; items: number }>();
  for (const c of candidates) {
    const seen = new Set<string>();
    for (const t of c.topics) {
      if (!t || !byId.has(t)) continue;
      const row = tally.get(t) ?? { people: 0, items: 0 };
      row.items++;
      if (!seen.has(t)) row.people++;
      seen.add(t);
      tally.set(t, row);
    }
  }
  return [...tally]
    .sort(([a, x], [b, y]) => y.people - x.people || y.items - x.items || a.localeCompare(b))
    .slice(0, max)
    .map(([id]) => byId.get(id)!);
}
