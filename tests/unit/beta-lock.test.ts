import { afterEach, describe, expect, it } from "vitest";

import {
  betaPassword,
  betaToken,
  hasValidBetaCookie,
  isOpenPath,
  passwordMatches,
  safeEqual,
  safeNext,
} from "@/lib/beta-lock";

describe("beta lock", () => {
  afterEach(() => {
    delete process.env.BETA_PASSWORD;
  });

  it("is off when BETA_PASSWORD is unset or blank", () => {
    expect(betaPassword()).toBeUndefined();
    process.env.BETA_PASSWORD = "   ";
    expect(betaPassword()).toBeUndefined();
    process.env.BETA_PASSWORD = "civic-table";
    expect(betaPassword()).toBe("civic-table");
  });

  it("checks passwords exactly", async () => {
    expect(await passwordMatches("civic-table", "civic-table")).toBe(true);
    expect(await passwordMatches("civic-tabl", "civic-table")).toBe(false);
    expect(await passwordMatches("", "civic-table")).toBe(false);
  });

  it("accepts only the cookie for the current password", async () => {
    const token = await betaToken("civic-table");
    expect(token).not.toContain("civic");
    expect(await hasValidBetaCookie(token, "civic-table")).toBe(true);
    expect(await hasValidBetaCookie(token, "new-password")).toBe(false);
    expect(await hasValidBetaCookie(undefined, "civic-table")).toBe(false);
    expect(await hasValidBetaCookie("forged", "civic-table")).toBe(false);
  });

  it("compares strings safely", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });

  it("only redirects to same-site pages after unlocking", () => {
    expect(safeNext("/races/abc?x=1")).toBe("/races/abc?x=1");
    expect(safeNext("https://evil.example")).toBe("/");
    expect(safeNext("//evil.example")).toBe("/");
    expect(safeNext("/\\evil.example")).toBe("/");
    expect(safeNext("/unlock")).toBe("/");
    expect(safeNext("/api/discuss")).toBe("/");
    expect(safeNext(undefined)).toBe("/");
  });

  it("leaves only the unlock and health paths open", () => {
    expect(isOpenPath("/unlock")).toBe(true);
    expect(isOpenPath("/api/unlock")).toBe(true);
    expect(isOpenPath("/api/health")).toBe(true);
    expect(isOpenPath("/")).toBe(false);
    expect(isOpenPath("/api/discuss")).toBe(false);
    expect(isOpenPath("/ops")).toBe(false);
  });
});
