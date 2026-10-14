import { describe, expect, it } from "vitest";

import { canManageCandidate, hasRole, parseRole, type Session } from "@/lib/auth/roles";

const voter: Session = { userId: "u_voter", role: "voter" };
const candidate: Session = { userId: "u_cand", role: "candidate" };
const admin: Session = { userId: "u_admin", role: "admin" };

describe("parseRole", () => {
  it("accepts known roles", () => {
    expect(parseRole("admin")).toBe("admin");
    expect(parseRole("candidate")).toBe("candidate");
  });
  it("defaults anything else to voter", () => {
    for (const v of [undefined, null, "", "superuser", 1, { role: "admin" }]) expect(parseRole(v)).toBe("voter");
  });
});

describe("hasRole", () => {
  it("denies anonymous users everything", () => {
    expect(hasRole(null, "voter")).toBe(false);
  });
  it("orders roles voter < candidate < admin", () => {
    expect(hasRole(voter, "voter")).toBe(true);
    expect(hasRole(voter, "candidate")).toBe(false);
    expect(hasRole(candidate, "candidate")).toBe(true);
    expect(hasRole(candidate, "admin")).toBe(false);
    expect(hasRole(admin, "candidate")).toBe(true);
    expect(hasRole(admin, "admin")).toBe(true);
  });
});

describe("canManageCandidate", () => {
  it("lets the owning candidate and admins manage", () => {
    expect(canManageCandidate(candidate, { ownerUserId: "u_cand" })).toBe(true);
    expect(canManageCandidate(admin, { ownerUserId: null })).toBe(true);
  });
  it("blocks other candidates, voters, anonymous users and unclaimed profiles", () => {
    expect(canManageCandidate(candidate, { ownerUserId: "someone_else" })).toBe(false);
    expect(canManageCandidate(candidate, { ownerUserId: null })).toBe(false);
    expect(canManageCandidate({ userId: "u_voter", role: "voter" }, { ownerUserId: "u_voter" })).toBe(false);
    expect(canManageCandidate(null, { ownerUserId: "u_cand" })).toBe(false);
  });
});
