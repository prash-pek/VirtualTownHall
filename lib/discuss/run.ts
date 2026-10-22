import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import { getCatalog } from "@/lib/ballot/catalog";
import { getMeasureDetail, getRaceProfiles } from "@/lib/ballot/content";
import { getDb } from "@/lib/db/client";
import { aiCalls, sourceGaps } from "@/lib/db/schema";

import { overDailyBudget } from "./budget";
import { signRound, verifiedHistory, type SignedRound } from "./history";
import {
  buildPack,
  normalizeAnswers,
  normalizeTopic,
  sideLinks,
  systemPrompt,
  type ItemPack,
  type PackSource,
  type SideAnswer,
  type SideLink,
} from "./pack";
import { raceTitle } from "@/lib/ballot/types";

/**
 * Sonnet 5.5 at low effort (Prash, 2026-10-16): it matched Opus 5.5 on every quality measure in the
 * discussion eval at half the cost. Both are overridable without a code change.
 */
const model = process.env.DISCUSS_MODEL ?? "claude-sonnet-5-5";
const effort = (process.env.DISCUSS_EFFORT ?? "low") as "low" | "medium" | "high";

/** USD per million tokens [input, output, cache-read multiplier]; 5-minute cache writes bill at 1.25x input. */
const pricing: Record<string, [number, number, number]> = {
  "claude-opus-5-5": [4, 20, 0.05],
  "claude-sonnet-5-5": [2, 10, 0.1],
  "claude-haiku-5-5": [0.1, 0.5, 0.1],
};

/**
 * The side field names this item's side ids. It stays a plain string, not an enum: the SDK turns an
 * enum into a description the API doesn't enforce, and an answer with a label would then fail to parse
 * as a whole. normalizeAnswers maps labels back to ids instead.
 */
const answersSchema = (ids: string[]) =>
  z.object({
    topic: z.string().describe("The question's issue id, or other: and a few words"),
    responses: z.array(
      z.object({
        side: z.string().describe(`The side's id, exactly one of: ${ids.join(", ")}`),
        answer: z.string(),
        covered: z.boolean().describe("True only if this side's sources directly address the question"),
        sourceIds: z.array(z.number().int()),
      }),
    ),
  });

export type DiscussResult = {
  responses: (SideAnswer & {
    label: string;
    sources: { n: number; url: string | null; publisher: string | null }[];
    /** For a candidate: their own pages (or the voters' pamphlet), on every answer, so the voter can look themselves. */
    links?: SideLink[];
  })[];
  /** The question's issue id (or "other: …"); never the question itself. */
  topic: string;
  /** Sent back with the next question so the server can tell this round wasn't edited. */
  sig: string;
};

export class DiscussError extends Error {
  constructor(readonly code: "not_found" | "no_content" | "unavailable" | "upstream" | "paused") {
    super(code);
  }
}

async function loadPack(itemKey: string, preview: boolean): Promise<ItemPack> {
  const catalog = await getCatalog();
  const [type, slug] = itemKey.split(":") as [string, string];
  if (type === "race") {
    const race = catalog.races.find((r) => r.slug === slug);
    if (!race) throw new DiscussError("not_found");
    const profiles = await getRaceProfiles(slug, preview);
    return {
      kind: "race",
      title: raceTitle(race.office, race.districtLabel),
      background: [],
      sides: profiles.map((p) => ({
        id: p.slug,
        label: [p.name, p.party, p.incumbent ? "incumbent" : null].filter(Boolean).join(", "),
        facts: [...p.bio, ...p.positions, ...p.votingRecord],
        endorsements: p.endorsements,
        links: sideLinks(p),
      })),
    };
  }
  const measure = catalog.measures.find((m) => m.slug === slug);
  if (type !== "measure" || !measure) throw new DiscussError("not_found");
  const d = await getMeasureDetail(slug, preview);
  if (!d) throw new DiscussError("no_content");
  const official = (label: string, text: string | null): PackSource[] =>
    text
      ? [
          {
            statement: `${label}: ${text}`,
            excerpt: null,
            sourceUrl: d.fullTextUrl,
            publisher: "Official measure record",
          },
        ]
      : [];
  const side = (s: "yes" | "no") => ({
    id: s,
    label: `The case for ${s.toUpperCase()}`,
    facts: d.arguments.filter((a) => a.side === s && a.kind !== "explainer"),
    endorsements: d.endorsements.filter((e) => e.side === s),
  });
  return {
    kind: "measure",
    title: `Measure ${measure.number}: ${measure.title} (${measure.jurisdiction})`,
    background: [
      ...official("Summary", d.summary),
      ...official("A YES vote", d.yesMeans),
      ...official("A NO vote", d.noMeans),
      ...official("Fiscal impact", d.fiscalImpact),
      ...d.arguments.filter((a) => a.kind === "explainer"),
    ],
    sides: [side("yes"), side("no")],
  };
}

/** `only` limits a race to the candidates the voter chose to ask; measures always ask both sides. */
export async function discuss(
  itemKey: string,
  question: string,
  signedHistory: SignedRound[],
  preview: boolean,
  only?: string[],
) {
  // Production uses TOWNHALL_API_PROD (its own spend limits); preview and dev use TOWNHALL_ANTHROPIC_API_KEY.
  // ANTHROPIC_API_KEY also works (local dev, SDK default).
  const apiKey =
    process.env.TOWNHALL_API_PROD ?? process.env.TOWNHALL_ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new DiscussError("unavailable");
  if (await overDailyBudget()) throw new DiscussError("paused");
  const history = verifiedHistory(apiKey, itemKey, signedHistory);
  const pack = await loadPack(itemKey, preview);
  if (pack.kind === "race" && only?.length) pack.sides = pack.sides.filter((s) => only.includes(s.id));
  const hasContent = pack.background.length > 0 || pack.sides.some((s) => s.facts.length || s.endorsements.length);
  const ids = pack.sides.map((s) => s.id);
  if (!hasContent || ids.length === 0) throw new DiscussError("no_content");
  const { text, sources } = buildPack(pack);

  const client = new Anthropic({ apiKey });
  const started = Date.now();
  let message;
  try {
    message = await client.messages.parse({
      model,
      max_tokens: 8000,
      system: [
        { type: "text", text: systemPrompt(pack.kind) },
        { type: "text", text: `SOURCES:\n${text}`, cache_control: { type: "ephemeral" } },
      ],
      messages: [
        // A breakpoint on the last earlier answer lets the next follow-up read the history from cache too.
        ...history.slice(-3).flatMap((r, i, recent) => [
          { role: "user" as const, content: r.question },
          {
            role: "assistant" as const,
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ responses: r.responses }),
                ...(i === recent.length - 1 ? { cache_control: { type: "ephemeral" as const } } : {}),
              },
            ],
          },
        ]),
        { role: "user", content: question },
      ],
      output_config: { effort, format: zodOutputFormat(answersSchema(ids)) },
    });
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      console.error("discuss: Claude API error", e.status, e.message);
      throw new DiscussError("upstream");
    }
    throw e;
  }

  const u = message.usage;
  const [inPrice, outPrice, readRate] = pricing[model] ?? [0, 0, 0];
  const cost =
    ((u.input_tokens + (u.cache_read_input_tokens ?? 0) * readRate + (u.cache_creation_input_tokens ?? 0) * 1.25) *
      inPrice +
      u.output_tokens * outPrice) /
    1e6;
  await getDb()
    .insert(aiCalls)
    .values({
      route: "discuss",
      model,
      effort,
      inputTokens: u.input_tokens,
      outputTokens: u.output_tokens,
      cacheReadTokens: u.cache_read_input_tokens ?? 0,
      cacheWriteTokens: u.cache_creation_input_tokens ?? 0,
      latencyMs: Date.now() - started,
      stopReason: message.stop_reason,
      costUsd: cost.toFixed(6),
    })
    .catch((e: unknown) => console.error("discuss: failed to log ai_call", e));

  if (!message.parsed_output) throw new DiscussError("upstream");
  const answers = normalizeAnswers(pack, sources, message.parsed_output.responses);
  const topic = normalizeTopic(message.parsed_output.topic);
  const uncovered = answers.filter((a) => a.covered === false);
  if (uncovered.length > 0) {
    // Topic and side ids only, never the question: the privacy page promises we don't keep questions.
    await getDb()
      .insert(sourceGaps)
      .values({ itemKey, topic, uncoveredSides: uncovered.map((a) => a.side), sidesAsked: answers.length })
      .catch((e: unknown) => console.error("discuss: failed to log source gap", e));
  }
  return {
    topic,
    sig: signRound(apiKey, itemKey, { question, responses: answers }),
    responses: answers.map((a) => ({
      ...a,
      label: pack.sides.find((s) => s.id === a.side)?.label ?? a.side,
      // Every candidate's answer carries their links, covered or not: we can't judge what a voter finds relevant.
      ...(pack.kind === "race" ? { links: pack.sides.find((s) => s.id === a.side)?.links ?? [] } : {}),
      sources: a.sourceIds.flatMap((n) => {
        const s = sources.find((x) => x.n === n);
        return s ? [{ n, url: s.url, publisher: s.publisher }] : [];
      }),
    })),
  } satisfies DiscussResult;
}
