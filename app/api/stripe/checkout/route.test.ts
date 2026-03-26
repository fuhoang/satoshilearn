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
  getCancelUrl: () => "http://localhost:3000/purchases?checkout=canceled",
  getPlanDetails: (plan: string) => getPlanDetails(plan),
  getSuccessUrl: () => "http://localhost:3000/purchases?checkout=success",
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
        customer: "cus_123",
        mode: "subscription",
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      checkoutUrl: "https://checkout.stripe.com/session/test",
    });
  });
});
