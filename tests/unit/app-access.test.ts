import { describe, expect, it } from "vitest";

import { appAccess, hasAppAccess, isApiPath, isOpenApiPath } from "@/lib/auth/app-access";

describe("shared sign-in access list", () => {
  it("needs townhall on the list", () => {
    expect(hasAppAccess(["townhall"])).toBe(true);
    expect(hasAppAccess(["ladder", "townhall"])).toBe(true);
    expect(hasAppAccess(["ladder"])).toBe(false);
    expect(hasAppAccess([])).toBe(false);
    expect(hasAppAccess(undefined)).toBe(false);
    expect(hasAppAccess("townhall")).toBe(false);
    expect(hasAppAccess(["TownHall"])).toBe(false);
  });

  it("tells signed out, no access and ok apart", () => {
    expect(appAccess(null, ["townhall"])).toBe("signed-out");
    expect(appAccess(undefined, undefined)).toBe("signed-out");
    expect(appAccess("user_1", undefined)).toBe("no-access");
    expect(appAccess("user_1", ["ladder"])).toBe("no-access");
    expect(appAccess("user_1", ["townhall"])).toBe("ok");
  });

  it("leaves only the health check open among API routes", () => {
    expect(isApiPath("/api/discuss")).toBe(true);
    expect(isApiPath("/races/x")).toBe(false);
    expect(isOpenApiPath("/api/health")).toBe(true);
    expect(isOpenApiPath("/api/discuss")).toBe(false);
    expect(isOpenApiPath("/api/unlock")).toBe(false);
  });
});
