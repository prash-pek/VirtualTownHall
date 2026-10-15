/**
 * Role model (TRD v2 §1, §3.5). Roles live in Clerk `publicMetadata.role` and are assigned
 * out of band; a signed-in user without one is a voter. Pure functions so they're unit-testable.
 */
export const roles = ["voter", "candidate", "admin"] as const;
export type Role = (typeof roles)[number];

export type Session = { userId: string; role: Role } | null;

export function parseRole(value: unknown): Role {
  return typeof value === "string" && (roles as readonly string[]).includes(value) ? (value as Role) : "voter";
}

/** Admin can do anything a candidate or voter can; a candidate can do anything a voter can. */
const rank: Record<Role, number> = { voter: 0, candidate: 1, admin: 2 };

export function hasRole(session: Session, required: Role): boolean {
  return session !== null && rank[session.role] >= rank[required];
}

/**
 * A candidate's admin surface is open to its claimed owner (role `candidate`) and platform admins.
 * Every candidate-scoped query must go through this, never fetch by bare id (TRD v2 §10).
 */
export function canManageCandidate(session: Session, candidate: { ownerUserId: string | null }): boolean {
  if (session === null) return false;
  if (session.role === "admin") return true;
  return session.role === "candidate" && candidate.ownerUserId !== null && candidate.ownerUserId === session.userId;
}

export class AuthError extends Error {
  constructor(
    readonly code: "unauthenticated" | "forbidden",
    message = code === "unauthenticated" ? "Sign in required" : "Not allowed",
  ) {
    super(message);
    this.name = "AuthError";
  }
}
