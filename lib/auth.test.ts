import {
  authPrefixes,
  authProxyPrefixes,
  isAuthRoute,
  routeRequiresAuth,
} from "@/lib/auth";
import { config as proxyConfig } from "@/proxy";

describe("auth route helpers", () => {
  it("detects protected routes", () => {
    expect(routeRequiresAuth("/learn")).toBe(true);
    expect(routeRequiresAuth("/learn/module/foundations")).toBe(true);
    expect(routeRequiresAuth("/dashboard")).toBe(true);
    expect(routeRequiresAuth("/profiles")).toBe(true);
    expect(routeRequiresAuth("/purchases")).toBe(true);
    expect(routeRequiresAuth("/pricing")).toBe(false);
  });

  it("detects auth routes", () => {
    expect(isAuthRoute("/auth/login")).toBe(true);
    expect(isAuthRoute("/auth/register")).toBe(true);
    expect(isAuthRoute("/auth/forgot-password")).toBe(true);
    expect(isAuthRoute("/auth/reset-password")).toBe(false);
    expect(isAuthRoute("/auth/callback")).toBe(false);
  });

  it("keeps proxy matchers aligned with protected and auth routes", () => {
    const matcherSet = new Set(proxyConfig.matcher);

    authProxyPrefixes.forEach((prefix) => {
      expect(matcherSet).toContain(`${prefix}/:path*`);
    });

    authPrefixes.forEach((prefix) => {
      expect(isAuthRoute(prefix)).toBe(true);
    });
  });
});
