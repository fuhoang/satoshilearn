import { buildAuthCallbackUrl, sanitizeNextPath } from "@/lib/auth-redirects";

describe("auth redirect helpers", () => {
  it("keeps internal absolute paths", () => {
    expect(sanitizeNextPath("/profiles")).toBe("/profiles");
  });

  it("falls back for empty or unsafe paths", () => {
    expect(sanitizeNextPath()).toBe("/learn");
    expect(sanitizeNextPath("https://evil.example")).toBe("/learn");
    expect(sanitizeNextPath("//evil.example")).toBe("/learn");
  });

  it("builds the callback URL with a sanitized next path", () => {
    expect(buildAuthCallbackUrl("http://localhost:3000", "/learn")).toBe(
      "http://localhost:3000/auth/callback?next=%2Flearn",
    );
    expect(
      buildAuthCallbackUrl("http://localhost:3000", "https://evil.example"),
    ).toBe("http://localhost:3000/auth/callback?next=%2Flearn");
  });
});
