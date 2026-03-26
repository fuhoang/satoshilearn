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

  it("returns a billing portal URL", async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      portalUrl: "https://billing.stripe.com/session/test",
    });
  });
});
