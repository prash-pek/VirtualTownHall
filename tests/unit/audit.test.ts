import { describe, expect, it } from "vitest";

import { auditHash, canonicalJson } from "@/lib/audit/hash";

describe("canonicalJson", () => {
  it("sorts keys at every level and drops undefined", () => {
    expect(canonicalJson({ b: 1, a: { d: [2, { y: 1, x: 0 }], c: undefined } })).toBe(
      '{"a":{"d":[2,{"x":0,"y":1}]},"b":1}',
    );
  });
});

describe("auditHash", () => {
  const entry = { subjectType: "measure", subjectId: "m1", seq: 1, action: "publish", actorId: "u", payload: {} };

  it("is stable regardless of key order", () => {
    const reordered = { payload: {}, actorId: "u", action: "publish", seq: 1, subjectId: "m1", subjectType: "measure" };
    expect(auditHash(null, entry)).toBe(auditHash(null, reordered));
  });

  it("chains on the previous hash", () => {
    const first = auditHash(null, entry);
    const second = { ...entry, seq: 2, action: "unpublish" };
    expect(auditHash(first, second)).not.toBe(auditHash(null, second));
    expect(auditHash(first, second)).toMatch(/^[0-9a-f]{64}$/);
  });
});
