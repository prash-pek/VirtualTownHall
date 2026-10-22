/**
 * Beta password lock. While BETA_PASSWORD is set, every page and API route sits behind one shared
 * password; unset it and the site is open again. Runs in the proxy, so it only uses Web Crypto.
 *
 * The cookie holds an HMAC of the password, never the password itself. Changing the password
 * changes the HMAC, which signs every tester out.
 */

export const BETA_COOKIE = "th_beta";
export const BETA_COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 days

/** Paths that must work before a tester has unlocked. */
const OPEN_PATHS = new Set(["/unlock", "/api/unlock", "/api/health", "/robots.txt"]);

export function betaPassword(): string | undefined {
  const value = process.env.BETA_PASSWORD?.trim();
  return value ? value : undefined;
}

export function isOpenPath(pathname: string): boolean {
  return OPEN_PATHS.has(pathname);
}

const encoder = new TextEncoder();

async function hmacHex(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message)));
  return Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Compares two strings in time that depends only on their length. */
export function safeEqual(a: string, b: string): boolean {
  const ab = encoder.encode(a);
  const bb = encoder.encode(b);
  let diff = ab.length ^ bb.length;
  const len = Math.max(ab.length, bb.length);
  for (let i = 0; i < len; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

/** The cookie value that proves this browser entered the current password. */
export function betaToken(password: string): Promise<string> {
  return hmacHex(password, "townhall-beta-v1");
}

export async function hasValidBetaCookie(cookieValue: string | undefined, password: string): Promise<boolean> {
  if (!cookieValue) return false;
  return safeEqual(cookieValue, await betaToken(password));
}

/** Checks a typed password. Both sides are hashed first so the compare never leaks the length. */
export async function passwordMatches(attempt: string, password: string): Promise<boolean> {
  const [a, b] = await Promise.all([hmacHex("townhall-beta-check", attempt), hmacHex("townhall-beta-check", password)]);
  return safeEqual(a, b);
}

/** Only same-site paths, so the unlock form can't be used to bounce people elsewhere. */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  if (next.startsWith("/unlock") || next.startsWith("/api/")) return "/";
  return next;
}
