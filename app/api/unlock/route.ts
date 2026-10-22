import { ipAddress } from "@vercel/functions";
import { NextResponse } from "next/server";

import { BETA_COOKIE, BETA_COOKIE_MAX_AGE, betaPassword, betaToken, passwordMatches, safeNext } from "@/lib/beta-lock";
import { redisConfig } from "@/lib/env";
import { checkLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

function backToForm(request: Request, next: string, error: "wrong" | "slow") {
  const url = new URL("/unlock", request.url);
  url.searchParams.set("error", error);
  if (next !== "/") url.searchParams.set("next", next);
  return NextResponse.redirect(url, 303);
}

/** The unlock form posts here. On the right password it sets the cookie and sends the tester on. */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const next = safeNext(form?.get("next")?.toString());
  const password = betaPassword();
  if (!password) return NextResponse.redirect(new URL(next, request.url), 303);

  // Locally there may be no Redis; in production it's always configured, and a Redis failure
  // throws, which refuses the attempt rather than allowing unlimited guesses.
  if (redisConfig()) {
    const ip = ipAddress(request) ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = await checkLimit("betaUnlockPerIp", ip);
    if (!success) return backToForm(request, next, "slow");
  }

  const attempt = form?.get("password")?.toString() ?? "";
  if (!(await passwordMatches(attempt.trim(), password))) return backToForm(request, next, "wrong");

  const res = NextResponse.redirect(new URL(next, request.url), 303);
  res.cookies.set(BETA_COOKIE, await betaToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: BETA_COOKIE_MAX_AGE,
  });
  return res;
}
