import { POST } from "@/app/api/stripe/portal/route";

const getStripe = vi.fn();
const createBillingPortalSessionForCurrentUser = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripe: () => getStripe(),
}));

vi.mock("@/lib/billing", () => ({
  createBillingPortalSessionForCurrentUser: () =>
    createBillingPortalSessionForCurrentUser(),
}));

describe("stripe portal route", () => {
  beforeEach(() => {
    getStripe.mockReset();
    createBillingPortalSessionForCurrentUser.mockReset();

    getStripe.mockReturnValue({});
    createBillingPortalSessionForCurrentUser.mockResolvedValue(
      "https://billing.stripe.com/session/test",
    );
  });

  it("requires stripe billing to be configured", async () => {
    getStripe.mockReturnValue(null);

    const response = await POST();

    expect(response.status).toBe(500);
  });

  it("requires an authenticated customer", async () => {
    createBillingPortalSessionForCurrentUser.mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
  });

  it("treats empty portal URLs as unavailable", async () => {
    createBillingPortalSessionForCurrentUser.mockResolvedValue("");

    const response = await POST();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to open billing portal for this account.",
    });
  });

  it("returns a billing portal URL", async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      portalUrl: "https://billing.stripe.com/session/test",
    });
  });

  it("returns a service-unavailable response when portal creation throws", async () => {
    createBillingPortalSessionForCurrentUser.mockRejectedValue(new Error("network"));

    const response = await POST();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to reach Stripe right now. Please try again shortly.",
    });
  });
});
