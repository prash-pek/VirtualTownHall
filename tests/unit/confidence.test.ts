import { describe, expect, it } from "vitest";

import { needsALook } from "@/lib/review/confidence";

describe("needsALook", () => {
  it("flags items the verifier marked low confidence or old/undated", () => {
    expect(needsALook(["low_confidence"])).toBe(true);
    expect(needsALook(["paraphrase_faithful", "recency"])).toBe(true);
  });

  it("leaves fixed wording and clean items alone", () => {
    expect(needsALook(["paraphrase_faithful", "neutral_wording"])).toBe(false);
    expect(needsALook([])).toBe(false);
    expect(needsALook(null)).toBe(false);
  });
});
