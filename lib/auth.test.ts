import {
  isAuthRoute,
  routeRequiresAuth,
} from "@/lib/auth";

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
    expect(isAuthRoute("/auth/callback")).toBe(false);
  });
});
