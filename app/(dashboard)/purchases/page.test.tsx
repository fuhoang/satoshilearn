import { render, screen } from "@testing-library/react";

import PurchasesPage from "@/app/(dashboard)/purchases/page";

const getBillingContextForCurrentUser = vi.fn();

vi.mock("@/lib/account-status", () => ({
  getBillingContextForCurrentUser: () => getBillingContextForCurrentUser(),
}));

vi.mock("@/components/purchases/BillingActions", () => ({
  BillingActions: ({
    canOpenPortal,
  }: {
    canOpenPortal: boolean;
  }) => (
    <div>{canOpenPortal ? "Checkout and portal actions" : "Checkout actions"}</div>
  ),
}));

describe("purchases page route", () => {
  it("renders the billing hub with account status", async () => {
    getBillingContextForCurrentUser.mockResolvedValue({
      accountStatus: {
        billingSummary: "Free access is active for your account.",
        billingStatus: "No active subscription",
        canManageBilling: true,
        checkoutCtaLabel: "Upgrade to Pro",
        ctaHref: "/purchases",
        ctaLabel: "Open billing hub",
        headline: "Free plan",
        includedFeatures: ["Bitcoin curriculum access"],
        nextStep: "Choose a Pro plan to unlock more.",
        planLabel: "Free",
        planSummary: "Free plan summary",
        upcomingFeatures: ["Priority learning tracks and future premium modules"],
      },
      billingSnapshot: {
        configured: true,
        customerId: null,
        purchaseEvents: [],
        subscription: null,
      },
      priceMap: {
        pro_monthly: "price_monthly",
        pro_yearly: "price_yearly",
      },
      profile: {
        id: "user-1",
        email: "satoshi@example.com",
        display_name: "Satoshi",
        avatar_url: null,
        bio: null,
        timezone: null,
        created_at: "2026-03-01T00:00:00.000Z",
      },
    });

    const page = await PurchasesPage();

    render(page);

    expect(
      screen.getByText("Subscription and purchase history"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Free plan" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No purchases are linked to this account yet."),
    ).toBeInTheDocument();
    expect(screen.getByText("Billing actions")).toBeInTheDocument();
    expect(screen.getByText("Checkout actions")).toBeInTheDocument();
    expect(screen.getByText("Satoshi")).toBeInTheDocument();
    expect(screen.getByText("10 tutor requests per minute")).toBeInTheDocument();
    expect(
      screen.getByText("2 premium modules available with Pro"),
    ).toBeInTheDocument();
    expect(screen.getByText("Current access")).toBeInTheDocument();
    expect(screen.getByText("Monthly or yearly Pro")).toBeInTheDocument();
    expect(screen.getByText("Advanced Basics")).toBeInTheDocument();
    expect(screen.getByText("Mindset & Strategy")).toBeInTheDocument();
    expect(
      screen.getByText("Priority learning tracks and future premium modules"),
    ).toBeInTheDocument();
  });

  it("renders purchase events when present", async () => {
    getBillingContextForCurrentUser.mockResolvedValue({
      accountStatus: {
        billingSummary: "Pro monthly is active.",
        billingStatus: "Active subscription",
        canManageBilling: true,
        checkoutCtaLabel: "Change plan",
        ctaHref: "/purchases",
        ctaLabel: "Open billing hub",
        headline: "Pro monthly",
        includedFeatures: ["Everything in the free plan"],
        nextStep: "Use the billing hub to review renewals.",
        planLabel: "Pro",
        planSummary: "Pro summary",
        upcomingFeatures: ["More premium tracks and usage controls will build on this plan."],
      },
      billingSnapshot: {
        configured: true,
        customerId: "cus_123",
        purchaseEvents: [
          {
            id: "evt_1",
            user_id: "user-1",
            subscription_id: "sub_123",
            stripe_invoice_id: "in_123",
            stripe_checkout_session_id: null,
            event_type: "invoice.paid",
            amount_cents: 1900,
            currency: "gbp",
            status: "paid",
            created_at: "2026-03-25T00:00:00.000Z",
          },
        ],
        subscription: {
          user_id: "user-1",
          stripe_customer_id: "cus_123",
          stripe_subscription_id: "sub_123",
          stripe_price_id: "price_monthly",
          plan_slug: "pro_monthly",
          status: "active",
          current_period_start: "2026-03-01T00:00:00.000Z",
          current_period_end: "2026-04-01T00:00:00.000Z",
          cancel_at_period_end: false,
          created_at: "2026-03-01T00:00:00.000Z",
          updated_at: "2026-03-01T00:00:00.000Z",
        },
      },
      priceMap: {
        pro_monthly: "price_monthly",
        pro_yearly: "price_yearly",
      },
      profile: {
        id: "user-1",
        email: "satoshi@example.com",
        display_name: "Satoshi",
        avatar_url: null,
        bio: null,
        timezone: null,
        created_at: "2026-03-01T00:00:00.000Z",
      },
    });

    const page = await PurchasesPage();

    render(page);

    expect(screen.getByText("Invoice Paid")).toBeInTheDocument();
    expect(screen.getByText("19.00 GBP")).toBeInTheDocument();
    expect(screen.getByText("30 tutor requests per minute")).toBeInTheDocument();
    expect(screen.getByText("2 premium modules unlocked")).toBeInTheDocument();
    expect(screen.getByText("Next renewal")).toBeInTheDocument();
    expect(screen.getByText("01 Apr 2026")).toBeInTheDocument();
    expect(screen.getByText("Monthly billing")).toBeInTheDocument();
    expect(
      screen.getByText(/Latest paid invoice: 19\.00 GBP paid 25 Mar 2026\./),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Checkout and portal actions"),
    ).toBeInTheDocument();
  });

  it("renders cancellation timing when the subscription will end at period end", async () => {
    getBillingContextForCurrentUser.mockResolvedValue({
      accountStatus: {
        billingSummary: "Pro yearly is active and will end 01 Apr 2026.",
        billingStatus: "Cancels at period end",
        canManageBilling: true,
        checkoutCtaLabel: "Resume with a new plan",
        ctaHref: "/purchases",
        ctaLabel: "Open billing hub",
        headline: "Pro yearly",
        includedFeatures: ["Everything in the free plan"],
        nextStep: "Reactivate with a new checkout session before the current billing period ends if you want uninterrupted access.",
        planLabel: "Pro",
        planSummary: "Pro summary",
        upcomingFeatures: ["Subscription remains active until the current billing period ends."],
      },
      billingSnapshot: {
        configured: true,
        customerId: "cus_123",
        purchaseEvents: [],
        subscription: {
          user_id: "user-1",
          stripe_customer_id: "cus_123",
          stripe_subscription_id: "sub_123",
          stripe_price_id: "price_yearly",
          plan_slug: "pro_yearly",
          status: "active",
          current_period_start: "2025-04-01T00:00:00.000Z",
          current_period_end: "2026-04-01T00:00:00.000Z",
          cancel_at_period_end: true,
          created_at: "2025-04-01T00:00:00.000Z",
          updated_at: "2026-03-01T00:00:00.000Z",
        },
      },
      priceMap: {
        pro_monthly: "price_monthly",
        pro_yearly: "price_yearly",
      },
      profile: {
        id: "user-1",
        email: "satoshi@example.com",
        display_name: "Satoshi",
        avatar_url: null,
        bio: null,
        timezone: null,
        created_at: "2026-03-01T00:00:00.000Z",
      },
    });

    const page = await PurchasesPage();

    render(page);

    expect(screen.getByText("Access ends")).toBeInTheDocument();
    expect(screen.getByText("01 Apr 2026")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Cancellation is scheduled. Pro access remains active until 01 Apr 2026.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Yearly billing")).toBeInTheDocument();
  });
});
