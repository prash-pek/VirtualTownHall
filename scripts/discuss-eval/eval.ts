/**
 * Quality and cost eval for the per-item discussion, across models and effort levels.
 *
 *   npx tsx scripts/discuss-eval/eval.ts --data data/oregon-2026 [--outlets dir]
 *       [--configs opus-5-5@low,sonnet-5-5@low,...] [--items N] [--questions N]
 *       [--direct] [--yes] [--out dir] [--emit bundle.json]
 *
 * Without --yes it only prints what the run would cost. Answers are requested exactly as
 * lib/discuss/run.ts requests them (same system prompt, cached SOURCES block, structured output,
 * max_tokens, effort); each answer is then graded by a judge model that sees the same SOURCES.
 * Uses the Message Batches API (half price) unless --direct is passed. --emit writes the items and
 * tasks as JSON (for running the same eval somewhere the API key lives) and exits.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";

import Anthropic from "@anthropic-ai/sdk";

import { buildPack, systemPrompt } from "@/lib/discuss/pack";

import {
  answerParams,
  buildRecords,
  chunkRequests,
  judgeParams,
  parseAnswers,
  parseConfig,
  summarize,
  type Item,
  type Outcome,
  type Task,
} from "./core";
import { ballots, loadDataset, packFor } from "./packs";
import { prices } from "./prices";
import { questionsFor } from "./questions";

const { values: args } = parseArgs({
  options: {
    data: { type: "string", default: "data/oregon-2026" },
    outlets: { type: "string" },
    configs: {
      type: "string",
      default: "opus-5-5@low,opus-5-5@medium,sonnet-5-5@low,sonnet-5-5@medium,haiku-5-5@low,haiku-5-5@medium",
    },
    items: { type: "string" },
    questions: { type: "string", default: "4" },
    judge: { type: "string", default: "opus-5-5@high" },
    direct: { type: "boolean", default: false },
    yes: { type: "boolean", default: false },
    out: { type: "string", default: "scripts/discuss-eval/results" },
    emit: { type: "string" },
  },
});

const configs = args.configs.split(",").map(parseConfig);
const judge = parseConfig(args.judge);

async function runAll(
  client: Anthropic,
  reqs: { id: string; params: Anthropic.MessageCreateParamsNonStreaming }[],
): Promise<Map<string, Outcome>> {
  const out = new Map<string, Outcome>();
  if (args.direct) {
    let next = 0;
    const worker = async () => {
      while (next < reqs.length) {
        const r = reqs[next++]!;
        try {
          out.set(r.id, { message: await client.messages.create(r.params), error: null });
        } catch (e) {
          out.set(r.id, { message: null, error: e instanceof Error ? e.message : String(e) });
        }
      }
    };
    await Promise.all(Array.from({ length: 4 }, worker));
    return out;
  }
  for (const chunk of chunkRequests(reqs)) {
    const batch = await client.messages.batches.create({
      requests: chunk.map((r) => ({ custom_id: r.id, params: r.params })),
    });
    console.log(`batch ${batch.id}: ${chunk.length} requests`);
    for (;;) {
      const b = await client.messages.batches.retrieve(batch.id);
      if (b.processing_status === "ended") break;
      console.log(`  ${b.request_counts.processing} processing, ${b.request_counts.succeeded} done`);
      await new Promise((r) => setTimeout(r, 30_000));
    }
    for await (const r of await client.messages.batches.results(batch.id)) {
      out.set(
        r.custom_id,
        r.result.type === "succeeded"
          ? { message: r.result.message, error: null }
          : { message: null, error: r.result.type === "errored" ? JSON.stringify(r.result.error) : r.result.type },
      );
    }
  }
  return out;
}

const ds = await loadDataset(args.data, args.outlets);
const itemKeys = [...new Set(Object.values(ballots).flat())].slice(0, args.items ? Number(args.items) : undefined);
const items: Record<string, Item> = {};
const tasks: Task[] = [];
itemKeys.forEach((itemKey, i) => {
  const pack = packFor(ds, itemKey);
  if (!pack) return console.warn(`skipping ${itemKey}: no content`);
  items[itemKey] = { pack, sourcesText: buildPack(pack).text };
  for (const q of questionsFor(pack.kind, i, Number(args.questions)))
    for (const config of configs)
      tasks.push({ id: `a-${tasks.length}`, config, itemKey, question: q.text, qkind: q.kind });
});

if (args.emit) {
  await writeFile(args.emit, JSON.stringify({ judge, configs, items, tasks }));
  console.log(`wrote ${tasks.length} tasks over ${Object.keys(items).length} items to ${args.emit}`);
  process.exit(0);
}

// Rough pre-run estimate: 3.5 chars/token in, ~130 output tokens per side incl. low-effort thinking.
const discount = args.direct ? 1 : 0.5;
let estimate = 0;
const byPart = new Map<string, number>();
const addPart = (k: string, v: number) => byPart.set(k, (byPart.get(k) ?? 0) + v * discount);
for (const t of tasks) {
  const item = items[t.itemKey]!;
  const inTok = (systemPrompt(item.pack.kind).length + item.sourcesText.length) / 3.5;
  const outTok = 130 * item.pack.sides.length + 200;
  const p = prices[t.config.model]!;
  const j = prices[judge.model]!;
  const answerCost = (inTok * p.input + outTok * p.output) / 1e6;
  const judgeCost = ((inTok + outTok) * j.input + (600 + 100 * item.pack.sides.length) * j.output) / 1e6;
  estimate += answerCost + judgeCost;
  addPart(`answers ${t.config.name}`, answerCost);
  addPart(`judge (${judge.name})`, judgeCost);
}
estimate *= discount;
console.log(
  `${tasks.length} answers (${itemKeys.length} items x ${Number(args.questions) + 2} questions x ${configs.length} configs) + ${tasks.length} judge calls`,
);
console.log(`estimated spend ≈ $${estimate.toFixed(2)}${args.direct ? "" : " (Batch API, half price)"}`);
for (const [k, v] of byPart) console.log(`  ${k}: $${v.toFixed(2)}`);
if (!args.yes) {
  console.log("dry run: pass --yes to spend it");
  process.exit(0);
}
const apiKey = process.env.TOWNHALL_ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
if (!apiKey) throw new Error("TOWNHALL_ANTHROPIC_API_KEY is not set");

const client = new Anthropic({ apiKey });
const answers = await runAll(
  client,
  tasks.map((t) => ({ id: t.id, params: answerParams(t, items[t.itemKey]!) })),
);
const judged = await runAll(
  client,
  tasks.flatMap((t) => {
    const item = items[t.itemKey]!;
    const parsed = parseAnswers(item, answers.get(t.id)?.message);
    return parsed ? [{ id: `j-${t.id}`, params: judgeParams(t, item, parsed, judge) }] : [];
  }),
);

const records = buildRecords(tasks, items, answers, judged);
const table = summarize(records, configs);
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dir = join(args.out, stamp);
await mkdir(dir, { recursive: true });
await writeFile(join(dir, "records.json"), JSON.stringify(records, null, 1));
await writeFile(join(dir, "summary.md"), `${table}\n\nJudge: ${judge.name}. Items: ${itemKeys.join(", ")}\n`);
console.log(table);
console.log(`\nwrote ${dir}`);
