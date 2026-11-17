import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

import { appAccess, isApiPath, isOpenApiPath, PRIVATE_BETA } from "@/lib/auth/app-access";
import { signInUrl, signUpUrl } from "@/lib/auth/urls";

const isCandidateAdmin = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);
const isPlatformOps = createRouteMatcher(["/ops(.*)", "/api/ops(.*)"]);

const clerkConfigured = Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function apiDenied(error: "sign_in_required" | "no_access", status: 401 | 403) {
  const res = NextResponse.json({ error }, { status });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

/**
 * Shared Outset sign-in. Anyone can look at the pages. The API routes behind them (address
 * lookup, discussion, saved ballot) need a signed-in user whose access list includes TownHall;
 * the pages show a sign-in or "no access yet" box where a voter would start. /ops and /admin send
 * signed-out visitors to sign-in.
 *
 * First line of defence only: pages and route handlers re-check roles with requireRole(), and
 * the data layer scopes queries by owner (TRD v2 §10).
 */
const withClerk = clerkMiddleware(
  async (auth, req) => {
    const { pathname } = req.nextUrl;
    if (isApiPath(pathname) && !isOpenApiPath(pathname)) {
      const { userId, sessionClaims } = await auth();
      const access = appAccess(userId, sessionClaims?.apps);
      if (access === "signed-out") return apiDenied("sign_in_required", 401);
      if (access === "no-access") return apiDenied("no_access", 403);
    }
    if (isCandidateAdmin(req) || isPlatformOps(req)) {
      await auth.protect();
      const { userId, sessionClaims } = await auth();
      if (appAccess(userId, sessionClaims?.apps) !== "ok") {
        return NextResponse.rewrite(new URL("/no-access", req.url));
      }
    }
  },
  { signInUrl, signUpUrl },
);

function noindex(res: Response | undefined | null | void) {
  if (PRIVATE_BETA && res) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export default async function proxy(req: NextRequest, ev: Parameters<typeof withClerk>[1]) {
  return noindex(await routeRequest(req, ev));
}

async function routeRequest(req: NextRequest, ev: Parameters<typeof withClerk>[1]) {
  if (clerkConfigured) return withClerk(req, ev);
  // Without Clerk keys nobody can sign in, so everything that needs sign-in is closed, not open.
  // Local development (no Clerk keys in the development env) keeps the voter API open.
  const { pathname } = req.nextUrl;
  const apiClosed = process.env.NODE_ENV === "production" && isApiPath(pathname) && !isOpenApiPath(pathname);
  if (isCandidateAdmin(req) || isPlatformOps(req) || apiClosed) {
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
