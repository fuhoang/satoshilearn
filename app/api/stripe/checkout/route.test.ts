import { POST } from "@/app/api/stripe/checkout/route";

const getStripe = vi.fn();
const getPlanDetails = vi.fn();
const ensureStripeCustomerForCurrentUser = vi.fn();
const createSession = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripe: () => getStripe(),
}));

vi.mock("@/lib/billing", () => ({
  ensureStripeCustomerForCurrentUser: () => ensureStripeCustomerForCurrentUser(),
  getCancelUrl: () => "http://localhost:3000/purchases/canceled",
  getPlanDetails: (plan: string) => getPlanDetails(plan),
  getSuccessUrl: () => "http://localhost:3000/purchases/success",
}));

describe("stripe checkout route", () => {
  beforeEach(() => {
    getStripe.mockReset();
    getPlanDetails.mockReset();
    ensureStripeCustomerForCurrentUser.mockReset();
    createSession.mockReset();

    getStripe.mockReturnValue({
      checkout: {
        sessions: {
          create: createSession,
        },
      },
    });
    getPlanDetails.mockReturnValue({
      label: "Pro monthly",
      priceId: "price_monthly",
    });
    ensureStripeCustomerForCurrentUser.mockResolvedValue({
      customerId: "cus_123",
      user: {
        id: "user-1",
      },
    });
    createSession.mockResolvedValue({
      url: "https://checkout.stripe.com/session/test",
    });
  });

  it("requires stripe to be configured", async () => {
    getStripe.mockReturnValue(null);

    const response = await POST(
      new Request("http://localhost/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro_monthly" }),
      }),
    );

    expect(response.status).toBe(500);
  });

  it("rejects invalid plans", async () => {
    const response = await POST(
      new Request("http://localhost/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "wrong" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("rejects malformed request bodies", async () => {
    const response = await POST(
      new Request("http://localhost/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not-json",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Send a valid checkout request body.",
    });
  });

  it("returns a configuration error when plan details are unavailable", async () => {
    getPlanDetails.mockReturnValue(null);

    const response = await POST(
      new Request("http://localhost/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro_monthly" }),
      }),
    );

    expect(createSession).not.toHaveBeenCalled();
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Stripe billing is not configured yet.",
    });
  });

  it("requires an authenticated user", async () => {
    ensureStripeCustomerForCurrentUser.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro_monthly" }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("returns a checkout URL", async () => {
    const response = await POST(
      new Request("http://localhost/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro_monthly" }),
      }),
    );

    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        cancel_url: "http://localhost:3000/purchases/canceled",
        customer: "cus_123",
        mode: "subscription",
        success_url: "http://localhost:3000/purchases/success",
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      checkoutUrl: "https://checkout.stripe.com/session/test",
    });
  });

  it("fails when stripe does not return a checkout URL", async () => {
    createSession.mockResolvedValue({
      url: null,
    });

    const response = await POST(
      new Request("http://localhost/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro_monthly" }),
      }),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to start checkout right now.",
    });
  });

  it("returns a rate-limit response when Stripe rejects checkout creation", async () => {
    createSession.mockRejectedValue({
      type: "StripeRateLimitError",
    });

    const response = await POST(
      new Request("http://localhost/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro_monthly" }),
      }),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "Stripe is rate limiting checkout right now. Please try again in a minute.",
    });
  });

  it("returns a service-unavailable response when customer setup throws", async () => {
    ensureStripeCustomerForCurrentUser.mockRejectedValue(new Error("network"));

    const response = await POST(
      new Request("http://localhost/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro_monthly" }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to prepare checkout for this account right now.",
    });
  });
});
