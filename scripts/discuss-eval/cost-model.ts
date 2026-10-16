/**
 * Per-voter and at-scale cost of the per-item discussion, from the real prompt sizes of the test
 * ballots and a usage profile. No API calls.
 *
 *   npx tsx scripts/discuss-eval/cost-model.ts [data/oregon-2026] [outlets dir] [records.json]
 *
 * With an eval records.json, output tokens per side (answer plus thinking) come from measured usage
 * per config; otherwise from the assumptions below.
 */
import { readFile } from "node:fs/promises";

import { buildPack, systemPrompt } from "@/lib/discuss/pack";

import { prices } from "./prices";
import { ballots, loadDataset, packFor } from "./packs";

const CHARS_PER_TOKEN = 3.5;
const CACHE_WRITE = 1.25;
const QUESTION_TOKENS = 30;
const HISTORY_ROUNDS = 3; // run.ts replays the last 3 rounds

/** Output tokens per call = perSide x sides + fixed (thinking + JSON). Replaced by measurements when given. */
const assumed: Record<string, { perSide: number; fixed: number }> = {
  low: { perSide: 125, fixed: 250 },
  medium: { perSide: 135, fixed: 700 },
};

/** How many items a voter discusses and how many questions each. */
const profiles = {
  light: { itemShare: 0.4, questions: 1.5 },
  typical: { itemShare: 0.6, questions: 2.5 },
  heavy: { itemShare: 1, questions: 4 },
};

const configs = [
  { name: "opus-5-5@low", model: "claude-opus-5-5", effort: "low" },
  { name: "opus-5-5@medium", model: "claude-opus-5-5", effort: "medium" },
  { name: "sonnet-5-5@low", model: "claude-sonnet-5-5", effort: "low" },
  { name: "sonnet-5-5@medium", model: "claude-sonnet-5-5", effort: "medium" },
  { name: "haiku-5-5@low", model: "claude-haiku-5-5", effort: "low" },
] as const;

const ds = await loadDataset(process.argv[2] ?? "data/oregon-2026", process.argv[3] || undefined);
const measured = new Map<string, { perSide: number; fixed: number }>();
if (process.argv[4]) {
  type Rec = { config: string; sides: number; usage: { output_tokens: number } | null };
  const recs = JSON.parse(await readFile(process.argv[4], "utf8")) as Rec[];
  for (const c of new Set(recs.map((r) => r.config))) {
    // Least-squares fit of output tokens against number of sides.
    const pts = recs.filter((r) => r.config === c && r.usage).map((r) => [r.sides, r.usage!.output_tokens] as const);
    const n = pts.length;
    const mx = pts.reduce((s, p) => s + p[0], 0) / n;
    const my = pts.reduce((s, p) => s + p[1], 0) / n;
    const slope =
      pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / (pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0) || 1);
    measured.set(c, { perSide: slope, fixed: my - slope * mx });
  }
}

/** Expected cost of one voter's questions on one item: first question cold or warm, follow-ups warm. */
function itemCost(
  model: string,
  out: { perSide: number; fixed: number },
  prefix: number,
  sides: number,
  q: number,
  firstWarm: boolean,
) {
  const p = prices[model]!;
  const outTok = out.perSide * sides + out.fixed;
  const answerTok = out.perSide * sides + 20; // what gets replayed as history (no thinking)
  let cost = 0;
  for (let i = 0; i < Math.ceil(q); i++) {
    const weight = i < Math.floor(q) ? 1 : q - Math.floor(q);
    const warm = i > 0 || firstWarm;
    const history = Math.min(i, HISTORY_ROUNDS) * (answerTok + QUESTION_TOKENS);
    const input =
      (warm ? prefix * p.cacheRead : prefix * p.input * CACHE_WRITE) + (history + QUESTION_TOKENS) * p.input;
    cost += (weight * (input + outTok * p.output)) / 1e6;
  }
  return cost;
}

const fmt = (n: number) => (n >= 100 ? `$${n.toFixed(0)}` : n >= 1 ? `$${n.toFixed(2)}` : `$${n.toFixed(3)}`);
for (const [ballot, keys] of Object.entries(ballots)) {
  const items = keys.flatMap((k) => {
    const pack = packFor(ds, k);
    if (!pack) return [];
    return [
      {
        key: k,
        sides: pack.sides.length,
        prefix: Math.round((systemPrompt(pack.kind).length + buildPack(pack).text.length) / CHARS_PER_TOKEN),
      },
    ];
  });
  console.log(`\n## ${ballot}: ${items.length} items, ${items.reduce((s, i) => s + i.sides, 0)} sides`);
  console.log(
    "| Config | Profile | Questions | Per voter (cold cache) | Per voter (warm cache) | 1k voters | 10k voters | 100k voters |",
  );
  console.log("|---|---|---|---|---|---|---|---|");
  for (const c of configs) {
    const out = measured.get(c.name) ?? assumed[c.effort]!;
    for (const [name, pr] of Object.entries(profiles)) {
      // Every item discussed with probability itemShare: expected cost = share x full-item cost.
      const cold = items.reduce(
        (s, i) => s + pr.itemShare * itemCost(c.model, out, i.prefix, i.sides, pr.questions, false),
        0,
      );
      const warm = items.reduce(
        (s, i) => s + pr.itemShare * itemCost(c.model, out, i.prefix, i.sides, pr.questions, true),
        0,
      );
      // At 1k voters spread over weeks most first questions miss the 5-minute cache; at 10k about half
      // hit; at 100k nearly all popular items stay warm.
      const at = (n: number, warmShare: number) => n * (warmShare * warm + (1 - warmShare) * cold);
      const qs = items.length * pr.itemShare * pr.questions;
      console.log(
        `| ${c.name}${measured.has(c.name) ? " (measured)" : ""} | ${name} | ${qs.toFixed(0)} | ${fmt(cold)} | ${fmt(warm)} | ${fmt(at(1e3, 0.1))} | ${fmt(at(1e4, 0.5))} | ${fmt(at(1e5, 0.9))} |`,
      );
    }
  }
}
