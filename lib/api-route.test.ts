const createServerSupabaseClient = vi.fn();
const getUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => createServerSupabaseClient(),
}));

describe("api route helpers", () => {
  beforeEach(() => {
    createServerSupabaseClient.mockReset();
    getUser.mockReset();
  });

  describe("parseJsonBody", () => {
    it("returns parsed request bodies", async () => {
      const { parseJsonBody } = await import("@/lib/api-route");

      const result = await parseJsonBody<{ plan: string }>(
        new Request("http://localhost/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: "pro_monthly" }),
        }),
        "Bad body",
      );

      expect(result).toEqual({
        data: {
          plan: "pro_monthly",
        },
      });
    });

    it("returns a 400 response for malformed JSON", async () => {
      const { parseJsonBody } = await import("@/lib/api-route");

      const result = await parseJsonBody(
        new Request("http://localhost/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{",
        }),
        "Bad body",
      );

      expect("response" in result).toBe(true);
      if ("response" in result) {
        expect(result.response.status).toBe(400);
        await expect(result.response.json()).resolves.toEqual({
          error: "Bad body",
        });
      }
    });
  });

  describe("getServerSupabaseOrError", () => {
    it("returns the supabase client when available", async () => {
      createServerSupabaseClient.mockResolvedValue({
        auth: {
          getUser,
        },
      });
      const { getServerSupabaseOrError } = await import("@/lib/api-route");

      const result = await getServerSupabaseOrError();

      expect("supabase" in result).toBe(true);
    });

    it("returns a 500 response when supabase is unconfigured", async () => {
      createServerSupabaseClient.mockResolvedValue(null);
      const { getServerSupabaseOrError } = await import("@/lib/api-route");

      const result = await getServerSupabaseOrError();

      expect("response" in result).toBe(true);
      if ("response" in result) {
        expect(result.response.status).toBe(500);
        await expect(result.response.json()).resolves.toEqual({
          error: "Supabase is not configured.",
        });
      }
    });

    it("returns a 503 response when supabase creation throws", async () => {
      createServerSupabaseClient.mockRejectedValue(new Error("network"));
      const { getServerSupabaseOrError } = await import("@/lib/api-route");

      const result = await getServerSupabaseOrError({
        unavailableMessage: "Temporary outage",
      });

      expect("response" in result).toBe(true);
      if ("response" in result) {
        expect(result.response.status).toBe(503);
        await expect(result.response.json()).resolves.toEqual({
          error: "Temporary outage",
        });
      }
    });
  });

  describe("getAuthenticatedServerSupabaseOrError", () => {
    it("returns the authenticated user and supabase client", async () => {
      getUser.mockResolvedValue({
        data: {
          user: { id: "user-1" },
        },
      });
      createServerSupabaseClient.mockResolvedValue({
        auth: {
          getUser,
        },
      });
      const { getAuthenticatedServerSupabaseOrError } = await import(
        "@/lib/api-route"
      );

      const result = await getAuthenticatedServerSupabaseOrError({
        unauthorizedMessage: "Unauthorized",
      });

      expect(result).toEqual({
        supabase: expect.any(Object),
        user: { id: "user-1" },
      });
    });

    it("returns a 401 response when the user is missing", async () => {
      getUser.mockResolvedValue({
        data: {
          user: null,
        },
      });
      createServerSupabaseClient.mockResolvedValue({
        auth: {
          getUser,
        },
      });
      const { getAuthenticatedServerSupabaseOrError } = await import(
        "@/lib/api-route"
      );

      const result = await getAuthenticatedServerSupabaseOrError({
        unauthorizedMessage: "Unauthorized",
      });

      expect("response" in result).toBe(true);
      if ("response" in result) {
        expect(result.response.status).toBe(401);
        await expect(result.response.json()).resolves.toEqual({
          error: "Unauthorized",
        });
      }
    });

    it("returns a 503 response when auth verification throws", async () => {
      getUser.mockRejectedValue(new Error("network"));
      createServerSupabaseClient.mockResolvedValue({
        auth: {
          getUser,
        },
      });
      const { getAuthenticatedServerSupabaseOrError } = await import(
        "@/lib/api-route"
      );

      const result = await getAuthenticatedServerSupabaseOrError({
        unauthorizedMessage: "Unauthorized",
        verifyMessage: "Unable to verify",
      });

      expect("response" in result).toBe(true);
      if ("response" in result) {
        expect(result.response.status).toBe(503);
        await expect(result.response.json()).resolves.toEqual({
          error: "Unable to verify",
        });
      }
    });
  });

  describe("createStripeRouteErrorResponse", () => {
    const messages = {
      authentication: "Auth error",
      connection: "Connection error",
      fallback: "Fallback error",
      rateLimit: "Rate limit error",
    };

    it("maps rate-limit errors to 429", async () => {
      const { createStripeRouteErrorResponse } = await import("@/lib/api-route");

      const response = createStripeRouteErrorResponse(
        { type: "StripeRateLimitError" },
        messages,
      );

      expect(response.status).toBe(429);
      await expect(response.json()).resolves.toEqual({
        error: "Rate limit error",
      });
    });

    it("maps authentication errors to 502", async () => {
      const { createStripeRouteErrorResponse } = await import("@/lib/api-route");

      const response = createStripeRouteErrorResponse(
        { type: "StripeAuthenticationError" },
        messages,
      );

      expect(response.status).toBe(502);
      await expect(response.json()).resolves.toEqual({
        error: "Auth error",
      });
    });

    it("maps connection-like errors to 503", async () => {
      const { createStripeRouteErrorResponse } = await import("@/lib/api-route");

      const response = createStripeRouteErrorResponse(
        new Error("Network timeout while connecting"),
        messages,
      );

      expect(response.status).toBe(503);
      await expect(response.json()).resolves.toEqual({
        error: "Connection error",
      });
    });

    it("maps unknown errors to the fallback response", async () => {
      const { createStripeRouteErrorResponse } = await import("@/lib/api-route");

      const response = createStripeRouteErrorResponse(
        new Error("unexpected"),
        messages,
      );

      expect(response.status).toBe(502);
      await expect(response.json()).resolves.toEqual({
        error: "Fallback error",
      });
    });
  });
});
