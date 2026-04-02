import {
  getApiErrorMessage,
  getNetworkErrorMessage,
} from "@/lib/client-api";

describe("client api helpers", () => {
  it("prefers payload errors for bad requests", async () => {
    const message = await getApiErrorMessage(
      new Response(JSON.stringify({ error: "Use a smaller image." }), {
        status: 400,
      }),
      {
        badRequestMessage: "Bad request fallback",
        fallbackMessage: "Fallback",
      },
    );

    expect(message).toBe("Use a smaller image.");
  });

  it("uses the unauthorized fallback when the response body is empty", async () => {
    const message = await getApiErrorMessage(
      new Response(null, { status: 401 }),
      {
        fallbackMessage: "Fallback",
        unauthorizedMessage: "Please log in again.",
      },
    );

    expect(message).toBe("Please log in again.");
  });

  it("uses the rate-limit fallback when the response body is empty", async () => {
    const message = await getApiErrorMessage(
      new Response(null, { status: 429 }),
      {
        fallbackMessage: "Fallback",
        rateLimitMessage: "Please wait a minute and try again.",
      },
    );

    expect(message).toBe("Please wait a minute and try again.");
  });

  it("uses the unavailable fallback for 503 responses without a payload", async () => {
    const message = await getApiErrorMessage(
      new Response(null, { status: 503 }),
      {
        fallbackMessage: "Fallback",
        unavailableMessage: "Service is temporarily unavailable.",
      },
    );

    expect(message).toBe("Service is temporarily unavailable.");
  });

  it("falls back to the generic message for unknown statuses", async () => {
    const message = await getApiErrorMessage(
      new Response(null, { status: 500 }),
      {
        fallbackMessage: "Fallback",
      },
    );

    expect(message).toBe("Fallback");
  });

  it("returns the network-specific message when provided", () => {
    expect(
      getNetworkErrorMessage({
        fallbackMessage: "Fallback",
        networkMessage: "Check your connection.",
        unavailableMessage: "Unavailable",
      }),
    ).toBe("Check your connection.");
  });
});
