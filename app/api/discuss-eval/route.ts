/**
 * TEMPORARY (delete after the discussion model eval, see docs/discussion-cost-eval.md): runs the
 * fixed eval in bundle.json with TOWNHALL_ANTHROPIC_API_KEY where it lives, on Vercel, so the key
 * is never copied elsewhere. It takes no prompts or models from the caller, only the batch ids it
 * returned itself. Works only on preview deployments, only before EXPIRES, and only with the eval
 * token (its SHA-256 is below; the token itself is not in the repo). Approved by Prash 2026-10-16.
 *
 *   ?step=start                      submit the answer batch
 *   ?step=status&id=msgbatch_…       batch progress
 *   ?step=judge&id=<answers batch>   submit the grading batch from the finished answers
 *   ?step=results&answers=…&judge=…[&page=N]  summary table plus 40 records per page
 */
import { createHash, timingSafeEqual } from "node:crypto";

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import {
  answerParams,
  buildRecords,
  judgeParams,
  parseAnswers,
  summarize,
  type Config,
  type Item,
  type Outcome,
  type Task,
} from "@/scripts/discuss-eval/core";

import bundleJson from "./bundle.json";

export const maxDuration = 300;

const EXPIRES = Date.parse("2026-10-17T20:00:00Z");
const TOKEN_SHA256 = "010b60384f923f0694fb15a3e2e28b6eca95bdf7ddffbc9f0b398b2b9aa87315";
const PAGE = 40;

const bundle = bundleJson as unknown as {
  judge: Config;
  configs: Config[];
  items: Record<string, Item>;
  tasks: Task[];
};

function allowed(url: URL): boolean {
  if (process.env.VERCEL_ENV !== "preview" || Date.now() > EXPIRES) return false;
  const got = createHash("sha256")
    .update(url.searchParams.get("t") ?? "")
    .digest();
  return timingSafeEqual(got, Buffer.from(TOKEN_SHA256, "hex"));
}

const batchId = (s: string | null) => (s && /^msgbatch_[A-Za-z0-9]+$/.test(s) ? s : null);

async function outcomes(client: Anthropic, id: string): Promise<Map<string, Outcome>> {
  const out = new Map<string, Outcome>();
  for await (const r of await client.messages.batches.results(id)) {
    out.set(
      r.custom_id,
      r.result.type === "succeeded"
        ? { message: r.result.message, error: null }
        : { message: null, error: r.result.type === "errored" ? JSON.stringify(r.result.error) : r.result.type },
    );
  }
  return out;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!allowed(url)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const apiKey = process.env.TOWNHALL_ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "no_key" }, { status: 503 });
  const client = new Anthropic({ apiKey });
  const step = url.searchParams.get("step");

  if (step === "start") {
    const batch = await client.messages.batches.create({
      requests: bundle.tasks.map((t) => ({ custom_id: t.id, params: answerParams(t, bundle.items[t.itemKey]!) })),
    });
    return NextResponse.json({ id: batch.id, requests: bundle.tasks.length });
  }

  if (step === "status") {
    const id = batchId(url.searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    const b = await client.messages.batches.retrieve(id);
    return NextResponse.json({ id, processing_status: b.processing_status, request_counts: b.request_counts });
  }

  if (step === "judge") {
    const id = batchId(url.searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    if ((await client.messages.batches.retrieve(id)).processing_status !== "ended")
      return NextResponse.json({ error: "answers_not_finished" }, { status: 409 });
    const answers = await outcomes(client, id);
    const requests = bundle.tasks.flatMap((t) => {
      const item = bundle.items[t.itemKey]!;
      const parsed = parseAnswers(item, answers.get(t.id)?.message);
      return parsed ? [{ custom_id: `j-${t.id}`, params: judgeParams(t, item, parsed, bundle.judge) }] : [];
    });
    const batch = await client.messages.batches.create({ requests });
    return NextResponse.json({ id: batch.id, requests: requests.length });
  }

  if (step === "results") {
    const a = batchId(url.searchParams.get("answers"));
    const j = batchId(url.searchParams.get("judge"));
    if (!a || !j) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    const records = buildRecords(bundle.tasks, bundle.items, await outcomes(client, a), await outcomes(client, j));
    const page = Math.max(0, Number(url.searchParams.get("page") ?? 0) || 0);
    return NextResponse.json({
      summary: summarize(records, bundle.configs),
      total: records.length,
      page,
      records: records.slice(page * PAGE, (page + 1) * PAGE),
    });
  }

  return NextResponse.json({ error: "invalid_request" }, { status: 400 });
}
