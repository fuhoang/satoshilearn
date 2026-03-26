import { getAccountStatus } from "@/lib/billing";
import type { BillingSnapshot } from "@/types/billing";

function createSnapshot(overrides: Partial<BillingSnapshot> = {}): BillingSnapshot {
  return {
    configured: true,
    customerId: null,
    purchaseEvents: [],
    subscription: null,
    ...overrides,
  };
}

describe("billing helpers", () => {
  it("returns a free plan status when no subscription exists", () => {
    const status = getAccountStatus(createSnapshot());

    expect(status.planLabel).toBe("Free");
    expect(status.billingStatus).toBe("No active subscription");
    expect(status.checkoutCtaLabel).toBe("Upgrade to Pro");
  });

  it("returns a configured warning when billing is not configured", () => {
    const status = getAccountStatus(
      createSnapshot({
        configured: false,
      }),
    );

    expect(status.billingStatus).toBe("Billing not configured");
    expect(status.canManageBilling).toBe(false);
  });

  it("returns a pro status when an active subscription exists", () => {
    const status = getAccountStatus(
      createSnapshot({
        subscription: {
          user_id: "user-1",
          stripe_customer_id: "cus_123",
          stripe_subscription_id: "sub_123",
          stripe_price_id: "price_123",
          plan_slug: "pro_monthly",
          status: "active",
          current_period_start: "2026-03-01T00:00:00.000Z",
          current_period_end: "2026-04-01T00:00:00.000Z",
          cancel_at_period_end: false,
          created_at: "2026-03-01T00:00:00.000Z",
          updated_at: "2026-03-01T00:00:00.000Z",
        },
      }),
    );

    expect(status.planLabel).toBe("Pro");
    expect(status.headline).toBe("Pro monthly");
    expect(status.billingStatus).toBe("Active subscription");
    expect(status.checkoutCtaLabel).toBe("Change plan");
  });
});
