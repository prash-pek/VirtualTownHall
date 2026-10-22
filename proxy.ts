import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

import { signInUrl, signUpUrl } from "@/lib/auth/urls";
import { BETA_COOKIE, betaPassword, hasValidBetaCookie, isOpenPath } from "@/lib/beta-lock";

const isCandidateAdmin = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);
const isPlatformOps = createRouteMatcher(["/ops(.*)", "/api/ops(.*)"]);

const clerkConfigured = Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

/**
 * First line of defence only: pages and route handlers re-check roles with requireRole(), and
 * the data layer scopes queries by owner (TRD v2 §10).
 */
const withClerk = clerkMiddleware(
  async (auth, req) => {
    if (isCandidateAdmin(req) || isPlatformOps(req)) await auth.protect();
  },
  { signInUrl, signUpUrl },
);

/**
 * Beta lock: while BETA_PASSWORD is set, anyone can look at the pages, but every API route (address
 * lookup, discussion, saved ballot) answers 401 until this browser has the unlock cookie. The pages
 * show the password box where a voter would start (see components/beta-unlock.tsx).
 */
async function betaGate(req: NextRequest): Promise<NextResponse | null> {
  const password = betaPassword();
  if (!password) return null;
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/api/") && !pathname.startsWith("/trpc/")) return null;
  if (isOpenPath(pathname)) return null;
  if (await hasValidBetaCookie(req.cookies.get(BETA_COOKIE)?.value, password)) return null;

  const res = NextResponse.json({ error: "beta_locked" }, { status: 401 });
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

function noindexWhileLocked(res: Response | undefined | null | void) {
  if (betaPassword() && res) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export default async function proxy(req: NextRequest, ev: Parameters<typeof withClerk>[1]) {
  const blocked = await betaGate(req);
  if (blocked) return blocked;
  return noindexWhileLocked(await routeRequest(req, ev));
}

async function routeRequest(req: NextRequest, ev: Parameters<typeof withClerk>[1]) {
  if (clerkConfigured) return withClerk(req, ev);
  // Before Clerk is provisioned, protected surfaces are closed rather than open.
  if (isCandidateAdmin(req) || isPlatformOps(req)) {
    return NextResponse.json(
      { error: { code: "auth_not_configured", message: "Auth is not configured" } },
      { status: 503 },
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next internals and static files unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
