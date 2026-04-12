import { buildAuthCallbackUrl, sanitizeNextPath } from "@/lib/auth-redirects";

describe("auth redirect helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

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

  it("prefers NEXT_PUBLIC_SITE_URL when configured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://bloquera-chi.vercel.app");

    expect(buildAuthCallbackUrl("https://preview.bloquera.app", "/learn")).toBe(
      "https://bloquera-chi.vercel.app/auth/callback?next=%2Flearn",
    );
  });

  it("keeps the local origin in development even when NEXT_PUBLIC_SITE_URL is set", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://bloquera-chi.vercel.app");

    expect(buildAuthCallbackUrl("http://localhost:3000", "/learn")).toBe(
      "http://localhost:3000/auth/callback?next=%2Flearn",
    );
  });

  it("keeps the local origin in production when the app is opened on localhost", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://bloquera-chi.vercel.app");

    expect(buildAuthCallbackUrl("http://localhost:3000", "/learn")).toBe(
      "http://localhost:3000/auth/callback?next=%2Flearn",
    );
    expect(buildAuthCallbackUrl("http://127.0.0.1:3000", "/learn")).toBe(
      "http://127.0.0.1:3000/auth/callback?next=%2Flearn",
    );
  });
});
