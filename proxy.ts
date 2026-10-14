import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

import { signInUrl, signUpUrl } from "@/lib/auth/urls";

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

export default function proxy(req: NextRequest, ev: Parameters<typeof withClerk>[1]) {
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
