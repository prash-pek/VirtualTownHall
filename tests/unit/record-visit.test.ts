import { describe, expect, it } from "vitest";

import { VISIT_URL, placeOf, sendVisit, shouldRecordVisit } from "@/lib/auth/record-visit";

describe("record-visit", () => {
  it("reports only on the real address, once per cookie", () => {
    expect(shouldRecordVisit("townhallai.outsetinno.com", false)).toBe(true);
    expect(shouldRecordVisit("townhallai.outsetinno.com", true)).toBe(false);
    expect(shouldRecordVisit("townhall-ai-v2.vercel.app", false)).toBe(false);
    expect(shouldRecordVisit("evil-outsetinno.com", false)).toBe(false);
  });

  it("sends the person's token and the app id in the background", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const waits: Promise<unknown>[] = [];
    const fakeFetch = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(null, { status: 204 });
    }) as unknown as typeof fetch;
    expect(sendVisit({ app: "townhall", country: "US", region: "WA" }, "tok", (p) => waits.push(p), fakeFetch)).toBe(
      true,
    );
    await Promise.all(waits);
    const [call] = calls;
    if (!call) throw new Error("no report sent");
    expect(call.url).toBe(VISIT_URL);
    expect((call.init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
    expect(JSON.parse(String(call.init.body))).toEqual({ app: "townhall", country: "US", region: "WA" });
  });

  it("never throws when the report fails, and sends nothing without a token", async () => {
    const waits: Promise<unknown>[] = [];
    const failing = (async () => {
      throw new Error("down");
    }) as unknown as typeof fetch;
    expect(sendVisit({ app: "townhall" }, "tok", (p) => waits.push(p), failing)).toBe(true);
    await expect(Promise.all(waits)).resolves.toBeDefined();
    expect(sendVisit({ app: "townhall" }, null, () => {}, failing)).toBe(false);
  });

  it("takes the place from Vercel's country and region headers only", () => {
    const h = (o: Record<string, string>) => new Headers(o);
    expect(
      placeOf(h({ "x-vercel-ip-country": "US", "x-vercel-ip-country-region": "WA", "x-vercel-ip-city": "Seattle" })),
    ).toEqual({ country: "US", region: "WA" });
    expect(placeOf(h({}))).toEqual({});
  });
});
