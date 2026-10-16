import { ipAddress } from "@vercel/functions";
import { NextResponse } from "next/server";
import { z } from "zod";

import { hasRole } from "@/lib/auth/roles";
import { getSession } from "@/lib/auth/session";
import { DiscussError, discuss } from "@/lib/discuss/run";
import { checkLimit } from "@/lib/ratelimit";

const answer = z.object({
  side: z.string().max(200),
  answer: z.string().max(4000),
  sourceIds: z.array(z.number().int()).max(50),
});
const body = z.object({
  itemKey: z.string().regex(/^(race|measure):[a-z0-9-]+$/),
  question: z.string().trim().min(2).max(500),
  history: z
    .array(z.object({ question: z.string().max(500), responses: z.array(answer).max(60) }))
    .max(10)
    .default([]),
});

const status: Record<DiscussError["code"], number> = {
  not_found: 404,
  no_content: 409,
  unavailable: 503,
  upstream: 502,
};

/** One question, answered for every candidate (or YES and NO) from our sources only. */
export async function POST(request: Request) {
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const ip = ipAddress(request) ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await checkLimit("chatPerIp", ip);
  if (!success) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const preview = hasRole(await getSession(), "admin");
  try {
    const { itemKey, question, history } = parsed.data;
    return NextResponse.json(await discuss(itemKey, question, history, preview));
  } catch (e) {
    if (e instanceof DiscussError) return NextResponse.json({ error: e.code }, { status: status[e.code] });
    throw e;
  }
}
