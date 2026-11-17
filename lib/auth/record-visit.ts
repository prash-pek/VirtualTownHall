/**
 * App usage for the Outset access console (outsetinno.com/admin → Usage). Clerk can't tell which
 * app someone opened, because one sign-in covers every app, so each app reports it.
 *
 * When the proxy lets someone in, it posts { app } to outsetinno.com/api/visit with the person's
 * own session token, without waiting for the answer: if that site is slow or down, nothing here
 * notices. A cookie on this address keeps it to one report per person every 30 minutes.
 * It also sends the person's approximate place, the country and state codes Vercel adds to the
 * request from its IP lookup. Only the user id, app, day and place are stored, never the IP
 * (see outsetinno.com/privacy).
 *
 * Kept free of Next imports so it's unit-testable (tests/unit/record-visit.test.ts).
 */
export const VISIT_URL = "https://outsetinno.com/api/visit";
export const VISIT_COOKIE = "outset_visit";
export const VISIT_COOKIE_OPTIONS = {
  maxAge: 30 * 60,
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};

/** Only on the real address (production tokens) and only once per cookie lifetime. */
export function shouldRecordVisit(host: string, hasCookie: boolean): boolean {
  return !hasCookie && (host === "outsetinno.com" || host.endsWith(".outsetinno.com"));
}

/** Country and state or region codes from Vercel's IP lookup ("US", "WA"), when present. */
export function placeOf(headers: { get(name: string): string | null }): { country?: string; region?: string } {
  const country = headers.get("x-vercel-ip-country") ?? undefined;
  const region = headers.get("x-vercel-ip-country-region") ?? undefined;
  return country ? { country, region } : {};
}

/** Sends the report in the background. Returns false when there's no token to send. */
export function sendVisit(
  visit: { app: string; country?: string; region?: string },
  token: string | null | undefined,
  waitUntil: (p: Promise<unknown>) => void,
  fetchImpl: typeof fetch = fetch,
): boolean {
  if (!token) return false;
  waitUntil(
    fetchImpl(VISIT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(visit),
      signal: AbortSignal.timeout(3000),
    }).then(
      () => undefined,
      () => undefined,
    ),
  );
  return true;
}
