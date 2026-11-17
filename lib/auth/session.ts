import "server-only";

import { auth } from "@clerk/nextjs/server";

import { clerkEnabled } from "@/lib/env";

import { appAccess as accessFor, type AppAccess } from "./app-access";
import { AuthError, hasRole, parseRole, type Role, type Session } from "./roles";

/**
 * Current session with role. Only users with TownHall on their shared Outset access list count as
 * signed in here (see lib/auth/app-access.ts). The role and access list come from the session
 * token, so the shared Clerk session token must include
 * `{ "apps": "{{user.private_metadata.apps}}", "metadata": "{{user.public_metadata}}" }` (README → Auth).
 */
export async function getSession(): Promise<Session> {
  if (!clerkEnabled()) return null;
  const { userId, sessionClaims } = await auth();
  if (accessFor(userId, sessionClaims?.apps) !== "ok" || !userId) return null;
  return { userId, role: parseRole(sessionClaims?.metadata?.role) };
}

/**
 * Whether this visitor can use the voter features: signed out, signed in without TownHall on
 * their list, or ok. Without Clerk (local development) everything is open.
 */
export async function getAppAccess(): Promise<AppAccess> {
  if (!clerkEnabled()) return "ok";
  const { userId, sessionClaims } = await auth();
  return accessFor(userId, sessionClaims?.apps);
}

/** Throws AuthError unless the current user has at least `role`. */
export async function requireRole(role: Role): Promise<NonNullable<Session>> {
  const session = await getSession();
  if (!session) throw new AuthError("unauthenticated");
  if (!hasRole(session, role)) throw new AuthError("forbidden");
  return session;
}
