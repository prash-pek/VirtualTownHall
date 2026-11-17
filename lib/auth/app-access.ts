/**
 * Shared Outset sign-in. One Clerk app serves every *.outsetinno.com app, so a sign-in carries
 * over between them. Each user's Clerk private metadata lists the apps they may use
 * (`{ "apps": ["townhall", ...] }`), and the shared session token copies that list into the
 * `apps` claim, so checking it needs no Clerk API call. Pure functions so they're unit-testable
 * and safe to run in the proxy.
 */
export const APP_ID = "townhall";

/** "ok": signed in with TownHall on their list. "no-access": signed in without it. */
export type AppAccess = "signed-out" | "no-access" | "ok";

export function hasAppAccess(apps: unknown): boolean {
  return Array.isArray(apps) && apps.includes(APP_ID);
}

export function appAccess(userId: string | null | undefined, apps: unknown): AppAccess {
  if (!userId) return "signed-out";
  return hasAppAccess(apps) ? "ok" : "no-access";
}

/** API routes that answer without sign-in. Everything else under /api needs this app on the list. */
const OPEN_API_PATHS = new Set(["/api/health"]);

export function isOpenApiPath(pathname: string): boolean {
  return OPEN_API_PATHS.has(pathname);
}

export function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/") || pathname.startsWith("/trpc/");
}

/**
 * While testers are the only users, keep search engines off every page. Flip at public launch,
 * along with granting access more widely.
 */
export const PRIVATE_BETA = true;
