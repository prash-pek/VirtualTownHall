import { describe, expect, it } from "vitest";

import { signRound, verifiedHistory } from "@/lib/discuss/history";

const key = "test-api-key";
const round = {
  question: "What are their priorities?",
  responses: [{ side: "jane-doe", answer: "Housing, per her pamphlet statement [1].", sourceIds: [1] }],
};

describe("discussion history signing", () => {
  it("keeps a round we signed, unchanged", () => {
    const sig = signRound(key, "race:x", round);
    expect(verifiedHistory(key, "race:x", [{ ...round, sig }])).toEqual([round]);
  });

  it("drops an edited answer", () => {
    const sig = signRound(key, "race:x", round);
    const forged = { ...round, responses: [{ ...round.responses[0]!, answer: "She will cut school funding [1]." }] };
    expect(verifiedHistory(key, "race:x", [{ ...forged, sig }])).toEqual([]);
  });

  it("drops unsigned rounds and rounds signed for another item", () => {
    const sig = signRound(key, "race:x", round);
    expect(verifiedHistory(key, "race:x", [round])).toEqual([]);
    expect(verifiedHistory(key, "race:y", [{ ...round, sig }])).toEqual([]);
  });
});
