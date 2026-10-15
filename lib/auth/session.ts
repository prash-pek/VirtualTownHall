import "server-only";

import { auth } from "@clerk/nextjs/server";

import { clerkEnabled } from "@/lib/env";

import { AuthError, hasRole, parseRole, type Role, type Session } from "./roles";

/**
 * Current session with role. The role comes from the session token, so the Clerk session token
 * must include `"metadata": "{{user.public_metadata}}"` (see README → Auth).
 */
export async function getSession(): Promise<Session> {
  if (!clerkEnabled()) return null;
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;
  return { userId, role: parseRole(sessionClaims?.metadata?.role) };
}

/** Throws AuthError unless the current user has at least `role`. */
export async function requireRole(role: Role): Promise<NonNullable<Session>> {
  const session = await getSession();
  if (!session) throw new AuthError("unauthenticated");
  if (!hasRole(session, role)) throw new AuthError("forbidden");
  return session;
}
