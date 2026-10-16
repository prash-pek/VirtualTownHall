/**
 * Quality and cost eval for the per-item discussion, across models and effort levels.
 *
 *   npx tsx scripts/discuss-eval/eval.ts --data data/oregon-2026 [--outlets dir]
 *       [--configs opus-5-5@low,sonnet-5-5@low,...] [--items N] [--questions N]
 *       [--direct] [--yes] [--out dir]
 *
 * Without --yes it only prints what the run would cost. Answers are requested exactly as
 * lib/discuss/run.ts requests them (same system prompt, cached SOURCES block, structured output,
 * max_tokens, effort); each answer is then graded by a judge model that sees the same SOURCES.
 * Uses the Message Batches API (half price) unless --direct is passed.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";

import Anthropic from "@anthropic-ai/sdk";

import { buildPack, normalizeAnswers, systemPrompt, type ItemPack, type SideAnswer } from "@/lib/discuss/pack";

import { ballots, loadDataset, packFor } from "./packs";
import { prices } from "./prices";
import { questionsFor, type QuestionKind } from "./questions";

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
  },
});

const CACHE_WRITE = 1.25;

type Config = { name: string; model: string; effort: "low" | "medium" | "high" | "xhigh" | "max" };
const parseConfig = (s: string): Config => {
  const [m, effort = "low"] = s.split("@") as [string, Config["effort"]];
  return { name: s, model: `claude-${m}`, effort };
};
const configs = args.configs.split(",").map(parseConfig);
const judge = parseConfig(args.judge);

const answersJsonSchema = {
  type: "object",
  properties: {
    responses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          side: { type: "string" },
          answer: { type: "string" },
          sourceIds: { type: "array", items: { type: "integer" } },
        },
        required: ["side", "answer", "sourceIds"],
        additionalProperties: false,
      },
    },
  },
  required: ["responses"],
  additionalProperties: false,
};

const judgeJsonSchema = {
  type: "object",
  properties: {
    sides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          side: { type: "string" },
          grounded: { type: "string", enum: ["full", "partial", "none", "declined"] },
          unsupportedClaims: { type: "array", items: { type: "string" } },
          citationsSupport: { type: "boolean" },
          wronglyDeclined: { type: "boolean" },
        },
        required: ["side", "grounded", "unsupportedClaims", "citationsSupport", "wronglyDeclined"],
        additionalProperties: false,
      },
    },
    neutral: { type: "boolean" },
    neutralityIssue: { type: "string" },
    evenHanded: { type: "boolean" },
    helpfulness: { type: "integer", enum: [1, 2, 3, 4, 5] },
  },
  required: ["sides", "neutral", "neutralityIssue", "evenHanded", "helpfulness"],
  additionalProperties: false,
};

const judgeSystem = `You grade answers from a nonpartisan voter-information tool. The tool must answer a voter's question once for every side (each candidate, or YES and NO on a measure) using ONLY the numbered SOURCES, citing source numbers, saying plainly when a side's sources don't address the question, never recommending a vote, and giving every side equal care.

For each side, judge strictly against the SOURCES (not your own knowledge):
- grounded: "full" if every factual claim is supported by the SOURCES, "partial" if some claim is not, "none" if the answer is mostly unsupported, "declined" if it says the sources don't cover the question.
- unsupportedClaims: each claim not supported by the SOURCES, quoted briefly. Paraphrase that keeps the meaning is supported; added specifics, inferred positions, or outside facts are not. An endorsement presented as the side's own words counts as unsupported.
- citationsSupport: true if the cited source numbers actually contain what the answer attributes to them (true when nothing is cited and the side declined).
- wronglyDeclined: true if the side declined (or said there's no record) but the SOURCES do contain something relevant to the question for that side.

Overall:
- neutral: false if any part recommends a vote, ranks sides, or calls one side right or better.
- neutralityIssue: the offending text if not neutral, else "".
- evenHanded: false if one side got clearly more care, length or favorable framing than the sources justify.
- helpfulness: 1-5, how well the answers, taken together, help this voter with this question while staying within the sources. 5 = direct, specific, clear and complete; 3 = correct but vague or misses relevant sourced material; 1 = unhelpful.`;

type Task = {
  id: string;
  config: Config;
  itemKey: string;
  pack: ItemPack;
  sourcesText: string;
  question: string;
  qkind: QuestionKind;
};

function answerParams(t: Task): Anthropic.MessageCreateParamsNonStreaming {
  // Mirrors lib/discuss/run.ts (single-turn).
  return {
    model: t.config.model,
    max_tokens: 8000,
    system: [
      { type: "text", text: systemPrompt(t.pack.kind) },
      { type: "text", text: `SOURCES:\n${t.sourcesText}`, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: t.question }],
    output_config: { effort: t.config.effort, format: { type: "json_schema", schema: answersJsonSchema } },
  };
}

function judgeParams(t: Task, answers: SideAnswer[]): Anthropic.MessageCreateParamsNonStreaming {
  const labelled = answers.map((a) => ({ ...a, label: t.pack.sides.find((s) => s.id === a.side)?.label }));
  return {
    model: judge.model,
    max_tokens: 16000,
    system: judgeSystem,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `SOURCES:\n${t.sourcesText}`, cache_control: { type: "ephemeral" } },
          {
            type: "text",
            text: `VOTER QUESTION: ${t.question}\n\nANSWERS (JSON):\n${JSON.stringify(labelled, null, 1)}`,
          },
        ],
      },
    ],
    output_config: { effort: judge.effort, format: { type: "json_schema", schema: judgeJsonSchema } },
  };
}

type Outcome = { message: Anthropic.Message | null; error: string | null };

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
  const batch = await client.messages.batches.create({
    requests: reqs.map((r) => ({ custom_id: r.id, params: r.params })),
  });
  console.log(`batch ${batch.id}: ${reqs.length} requests`);
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
  return out;
}

const parseJson = <T>(m: Anthropic.Message | null): T | null => {
  const text = m?.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") return null;
  try {
    return JSON.parse(text.text) as T;
  } catch {
    return null;
  }
};

/** Cost of one call at standard prices: cold = prefix written to cache, warm = prefix read from it. */
function callCost(model: string, u: Anthropic.Usage, warm: boolean) {
  const p = prices[model];
  if (!p) return 0;
  const prefix = u.input_tokens + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0);
  // Only the question is uncached; approximate it as 30 tokens.
  const cached = Math.max(prefix - 30, 0);
  const inputCost = warm ? cached * p.cacheRead + 30 * p.input : cached * p.input * CACHE_WRITE + 30 * p.input;
  return (inputCost + u.output_tokens * p.output) / 1e6;
}

const ds = await loadDataset(args.data, args.outlets);
const itemKeys = [...new Set(Object.values(ballots).flat())].slice(0, args.items ? Number(args.items) : undefined);
const tasks: Task[] = [];
itemKeys.forEach((itemKey, i) => {
  const pack = packFor(ds, itemKey);
  if (!pack) return console.warn(`skipping ${itemKey}: no content`);
  const sourcesText = buildPack(pack).text;
  for (const q of questionsFor(pack.kind, i, Number(args.questions)))
    for (const config of configs)
      tasks.push({
        id: `a-${tasks.length}`,
        config,
        itemKey,
        pack,
        sourcesText,
        question: q.text,
        qkind: q.kind,
      });
});

// Rough pre-run estimate: 3.5 chars/token in, ~130 output tokens per side incl. low-effort thinking.
const discount = args.direct ? 1 : 0.5;
let estimate = 0;
for (const t of tasks) {
  const inTok = (systemPrompt(t.pack.kind).length + t.sourcesText.length) / 3.5;
  const outTok = 130 * t.pack.sides.length + 200;
  const p = prices[t.config.model]!;
  const j = prices[judge.model]!;
  estimate += (inTok * p.input + outTok * p.output) / 1e6; // answer
  estimate += ((inTok + outTok) * j.input + (600 + 100 * t.pack.sides.length) * j.output) / 1e6; // judge
}
estimate *= discount;
console.log(
  `${tasks.length} answers (${itemKeys.length} items x ${Number(args.questions) + 2} questions x ${configs.length} configs) + ${tasks.length} judge calls`,
);
console.log(`estimated spend ≈ $${estimate.toFixed(2)}${args.direct ? "" : " (Batch API, half price)"}`);
if (!args.yes) {
  console.log("dry run: pass --yes to spend it");
  process.exit(0);
}
if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");

const client = new Anthropic();
const answers = await runAll(
  client,
  tasks.map((t) => ({ id: t.id, params: answerParams(t) })),
);
const parsed = new Map<string, SideAnswer[]>();
for (const t of tasks) {
  const raw = parseJson<{ responses: SideAnswer[] }>(answers.get(t.id)?.message ?? null);
  if (raw) parsed.set(t.id, normalizeAnswers(t.pack, buildPack(t.pack).sources, raw.responses));
}
const judged = await runAll(
  client,
  tasks.filter((t) => parsed.has(t.id)).map((t) => ({ id: `j-${t.id}`, params: judgeParams(t, parsed.get(t.id)!) })),
);

type Grade = {
  sides: {
    side: string;
    grounded: string;
    unsupportedClaims: string[];
    citationsSupport: boolean;
    wronglyDeclined: boolean;
  }[];
  neutral: boolean;
  neutralityIssue: string;
  evenHanded: boolean;
  helpfulness: number;
};

const records = tasks.map((t) => {
  const a = answers.get(t.id);
  const j = judged.get(`j-${t.id}`);
  return {
    id: t.id,
    config: t.config.name,
    itemKey: t.itemKey,
    sides: t.pack.sides.length,
    question: t.question,
    qkind: t.qkind,
    error: a?.error ?? (parsed.has(t.id) ? null : "unparseable"),
    stopReason: a?.message?.stop_reason ?? null,
    usage: a?.message?.usage ?? null,
    answers: parsed.get(t.id) ?? null,
    grade: parseJson<Grade>(j?.message ?? null),
    judgeUsage: j?.message?.usage ?? null,
  };
});

const pct = (n: number, d: number) => (d ? `${((100 * n) / d).toFixed(1)}%` : "n/a");
const lines = [
  "| Config | Calls | Failed | Out tok/side | $/question cold | $/question warm | Fully grounded | Unsupported claim | Wrongly declined | Gap Qs declined | Neutral | Even-handed | Helpful (1-5) |",
  "|---|---|---|---|---|---|---|---|---|---|---|---|---|",
];
for (const c of configs) {
  const rs = records.filter((r) => r.config === c.name);
  const ok = rs.filter((r) => r.usage && r.answers);
  const graded = ok.filter((r) => r.grade);
  const sideGrades = graded.flatMap((r) => r.grade!.sides);
  const answered = sideGrades.filter((s) => s.grounded !== "declined");
  const gapRs = graded.filter((r) => r.qkind === "gap");
  const gapSides = gapRs.flatMap((r) => r.grade!.sides);
  const outPerSide = ok.reduce((s, r) => s + r.usage!.output_tokens / r.sides, 0) / (ok.length || 1);
  const cold = ok.reduce((s, r) => s + callCost(c.model, r.usage!, false), 0) / (ok.length || 1);
  const warm = ok.reduce((s, r) => s + callCost(c.model, r.usage!, true), 0) / (ok.length || 1);
  lines.push(
    [
      c.name,
      rs.length,
      rs.length - ok.length,
      outPerSide.toFixed(0),
      `$${cold.toFixed(4)}`,
      `$${warm.toFixed(4)}`,
      pct(answered.filter((s) => s.grounded === "full").length, answered.length),
      pct(answered.filter((s) => s.unsupportedClaims.length > 0).length, answered.length),
      pct(sideGrades.filter((s) => s.wronglyDeclined).length, sideGrades.length),
      pct(gapSides.filter((s) => s.grounded === "declined").length, gapSides.length),
      pct(graded.filter((r) => r.grade!.neutral).length, graded.length),
      pct(graded.filter((r) => r.grade!.evenHanded).length, graded.length),
      (graded.reduce((s, r) => s + r.grade!.helpfulness, 0) / (graded.length || 1)).toFixed(2),
    ]
      .join(" | ")
      .replace(/^/, "| ") + " |",
  );
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dir = join(args.out, stamp);
await mkdir(dir, { recursive: true });
await writeFile(join(dir, "records.json"), JSON.stringify(records, null, 1));
await writeFile(
  join(dir, "summary.md"),
  `${lines.join("\n")}\n\nJudge: ${judge.name}. Items: ${itemKeys.join(", ")}\n`,
);
console.log(lines.join("\n"));
console.log(`\nwrote ${dir}`);
