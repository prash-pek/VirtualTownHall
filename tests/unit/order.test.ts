import { describe, expect, it } from "vitest";

import { compareMeasureNumbers, raceLevel, sortByLevel } from "@/lib/ballot/order";
import { inBallotOrder, type Catalog } from "@/lib/ballot/types";

describe("ballot order", () => {
  it("puts federal races first, then state, legislative, county and local", () => {
    const rows = [
      { office: "Mayor", jurisdictionType: "city" },
      { office: "Governor", jurisdictionType: "state" },
      { office: "County Commissioner", jurisdictionType: "county" },
      { office: "US Representative", jurisdictionType: "congressional_district" },
      { office: "State Representative", jurisdictionType: "state_house_district" },
      { office: "US Senator", jurisdictionType: "state" },
    ];
    expect(sortByLevel(rows, raceLevel).map((r) => r.office)).toEqual([
      "US Representative",
      "US Senator",
      "Governor",
      "State Representative",
      "County Commissioner",
      "Mayor",
    ]);
  });

  it("compares measure numbers numerically", () => {
    expect(["26-267", "26-30", "3-641", "119"].sort(compareMeasureNumbers)).toEqual([
      "3-641",
      "26-30",
      "26-267",
      "119",
    ]);
  });

  it("sorts a saved ballot into catalog order and drops unknown keys", () => {
    const catalog = {
      races: [{ key: "race:a" }, { key: "race:b" }],
      measures: [{ key: "measure:m" }],
    } as unknown as Catalog;
    expect(inBallotOrder(["measure:m", "race:x", "race:b", "race:a", "race:b"], catalog)).toEqual([
      "race:a",
      "race:b",
      "measure:m",
    ]);
  });
});
