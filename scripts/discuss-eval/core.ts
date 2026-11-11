/**
 * Shared pieces of the discussion eval: request shapes (mirroring lib/discuss/run.ts), the judge,
 * and scoring. Pure, so both the CLI (eval.ts) and a server route can use them.
 */
import type Anthropic from "@anthropic-ai/sdk";

import { buildPack, normalizeAnswers, systemPrompt, type ItemPack, type SideAnswer } from "@/lib/discuss/pack";

import { prices } from "./prices";
import type { QuestionKind } from "./questions";

const CACHE_WRITE = 1.25;

export type Config = { name: string; model: string; effort: "low" | "medium" | "high" | "xhigh" | "max" };
export const parseConfig = (s: string): Config => {
  const [m, effort = "low"] = s.split("@") as [string, Config["effort"]];
  return { name: s, model: `claude-${m}`, effort };
};

export type Item = { pack: ItemPack; sourcesText: string };
export type Task = { id: string; config: Config; itemKey: string; question: string; qkind: QuestionKind };

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

export function answerParams(t: Task, item: Item): Anthropic.MessageCreateParamsNonStreaming {
  // Mirrors lib/discuss/run.ts (single-turn).
  return {
    model: t.config.model,
    max_tokens: 8000,
    system: [
      { type: "text", text: systemPrompt(item.pack.kind) },
      { type: "text", text: `SOURCES:\n${item.sourcesText}`, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: t.question }],
    output_config: { effort: t.config.effort, format: { type: "json_schema", schema: answersJsonSchema } },
  };
}

export function judgeParams(
  t: Task,
  item: Item,
  answers: SideAnswer[],
  judge: Config,
): Anthropic.MessageCreateParamsNonStreaming {
  const labelled = answers.map((a) => ({ ...a, label: item.pack.sides.find((s) => s.id === a.side)?.label }));
  return {
    model: judge.model,
    max_tokens: 16000,
    system: judgeSystem,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `SOURCES:\n${item.sourcesText}`, cache_control: { type: "ephemeral" } },
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

export const parseJson = <T>(m: Anthropic.Message | null | undefined): T | null => {
  const text = m?.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") return null;
  try {
    return JSON.parse(text.text) as T;
  } catch {
    return null;
  }
};

/**
 * Maps the model's `side` values onto side ids. Models often return the label ("The case for YES",
 * "Jeff Merkley, Democrat, incumbent") instead of the id; production's normalizeAnswers matches ids
 * only, so those sides show "No answer was produced". This matches id, then label, then position.
 */
function relabel(item: Item, raw: SideAnswer[]): SideAnswer[] {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const sides = item.pack.sides;
  const pick = (a: SideAnswer, i: number) => {
    const v = norm(a.side);
    const hit =
      sides.find((s) => s.id === a.side) ??
      sides.find((s) => norm(s.label) === v) ??
      sides.find((s) => v.startsWith(norm(s.label)) || v.includes(norm(s.label))) ??
      (raw.length === sides.length ? sides[i] : undefined);
    return { ...a, side: hit?.id ?? a.side };
  };
  return raw.map(pick);
}

/** The answer for each side, or null if the model's output didn't parse. strict = production matching. */
export function parseAnswers(item: Item, m: Anthropic.Message | null | undefined, strict = false): SideAnswer[] | null {
  const raw = parseJson<{ responses: SideAnswer[] }>(m);
  if (!raw) return null;
  return normalizeAnswers(
    item.pack,
    buildPack(item.pack).sources,
    strict ? raw.responses : relabel(item, raw.responses),
  );
}

/** Sides production would show as "No answer was produced" for this output. */
export function droppedSides(item: Item, m: Anthropic.Message | null | undefined): number {
  const raw = parseJson<{ responses: SideAnswer[] }>(m);
  if (!raw) return 0;
  return item.pack.sides.filter((s) => !raw.responses.some((a) => a.side === s.id)).length;
}

/** Cost of one call at standard prices: cold = prefix written to cache, warm = prefix read from it. */
export function callCost(model: string, u: Anthropic.Usage, warm: boolean) {
  const p = prices[model];
  if (!p) return 0;
  const prefix = u.input_tokens + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0);
  // Only the question is uncached; approximate it as 30 tokens.
  const cached = Math.max(prefix - 30, 0);
  const inputCost = warm ? cached * p.cacheRead + 30 * p.input : cached * p.input * CACHE_WRITE + 30 * p.input;
  return (inputCost + u.output_tokens * p.output) / 1e6;
}

export type Grade = {
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

export type Outcome = { message: Anthropic.Message | null; error: string | null };

export type EvalRecord = {
  id: string;
  config: string;
  itemKey: string;
  sides: number;
  question: string;
  qkind: QuestionKind;
  error: string | null;
  stopReason: string | null;
  usage: Anthropic.Usage | null;
  answers: SideAnswer[] | null;
  droppedInProduction: number;
  grade: Grade | null;
  judgeUsage: Anthropic.Usage | null;
};

export function buildRecords(
  tasks: Task[],
  items: Record<string, Item>,
  answers: Map<string, Outcome>,
  judged: Map<string, Outcome>,
): EvalRecord[] {
  return tasks.map((t) => {
    const item = items[t.itemKey]!;
    const a = answers.get(t.id);
    const j = judged.get(`j-${t.id}`);
    const parsed = parseAnswers(item, a?.message);
    return {
      id: t.id,
      config: t.config.name,
      itemKey: t.itemKey,
      sides: item.pack.sides.length,
      question: t.question,
      qkind: t.qkind,
      error: a?.error ?? (parsed ? null : "unparseable"),
      stopReason: a?.message?.stop_reason ?? null,
      usage: a?.message?.usage ?? null,
      answers: parsed,
      droppedInProduction: droppedSides(item, a?.message),
      grade: parseJson<Grade>(j?.message),
      judgeUsage: j?.message?.usage ?? null,
    };
  });
}

/** Markdown table: one row per config. */
export function summarize(records: EvalRecord[], configs: Config[]): string {
  const pct = (n: number, d: number) => (d ? `${((100 * n) / d).toFixed(1)}%` : "n/a");
  const lines = [
    "| Config | Calls | Failed | Out tok/side | $/question cold | $/question warm | Fully grounded | Unsupported claim | Wrongly declined | Gap Qs declined | Neutral | Even-handed | Helpful (1-5) | Sides dropped in production |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|",
  ];
  for (const c of configs) {
    const rs = records.filter((r) => r.config === c.name);
    const ok = rs.filter((r) => r.usage && r.answers);
    const graded = ok.filter((r) => r.grade);
    const sideGrades = graded.flatMap((r) => r.grade!.sides);
    const answered = sideGrades.filter((s) => s.grounded !== "declined");
    const gapSides = graded.filter((r) => r.qkind === "gap").flatMap((r) => r.grade!.sides);
    const outPerSide = ok.reduce((s, r) => s + r.usage!.output_tokens / r.sides, 0) / (ok.length || 1);
    const cold = ok.reduce((s, r) => s + callCost(c.model, r.usage!, false), 0) / (ok.length || 1);
    const warm = ok.reduce((s, r) => s + callCost(c.model, r.usage!, true), 0) / (ok.length || 1);
    const cells = [
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
      pct(
        ok.reduce((s, r) => s + r.droppedInProduction, 0),
        ok.reduce((s, r) => s + r.sides, 0),
      ),
    ];
    lines.push(`| ${cells.join(" | ")} |`);
  }
  return lines.join("\n");
}

/** Splits batch requests so each batch stays under a request-body size and count. */
export function chunkRequests<T extends { params: unknown }>(reqs: T[], maxBytes = 3_500_000, maxCount = 400): T[][] {
  const chunks: T[][] = [[]];
  let size = 0;
  for (const r of reqs) {
    const n = JSON.stringify(r.params).length;
    const last = chunks.at(-1)!;
    if (last.length && (size + n > maxBytes || last.length >= maxCount)) {
      chunks.push([]);
      size = 0;
    }
    chunks.at(-1)!.push(r);
    size += n;
  }
  return chunks;
}
