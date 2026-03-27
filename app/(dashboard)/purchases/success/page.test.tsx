import { render, screen } from "@testing-library/react";

import PurchaseSuccessPage from "@/app/(dashboard)/purchases/success/page";

const getBillingContextForCurrentUser = vi.fn();

vi.mock("@/lib/account-status", () => ({
  getBillingContextForCurrentUser: () => getBillingContextForCurrentUser(),
}));

describe("purchase success page", () => {
  it("renders the success state with billing and learning links", async () => {
    getBillingContextForCurrentUser.mockResolvedValue({
      accountStatus: {
        billingSummary: "Pro monthly is active through 01 Apr 2026.",
        billingStatus: "Active subscription",
        canManageBilling: true,
        checkoutCtaLabel: "Change plan",
        ctaHref: "/purchases",
        ctaLabel: "Open billing hub",
        headline: "Pro monthly",
        includedFeatures: [],
        nextStep: "Use the billing hub to review renewals.",
        planLabel: "Pro",
        planSummary: "Pro summary",
        upcomingFeatures: [],
      },
      billingSnapshot: {
        configured: true,
        customerId: "cus_123",
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

    const page = await PurchaseSuccessPage();

    render(page);

    expect(
      screen.getByRole("heading", { level: 1, name: "Your Blockwise plan is ready." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Pro monthly")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open billing hub" }),
    ).toHaveAttribute("href", "/purchases");
    expect(
      screen.getByRole("link", { name: "Continue learning" }),
    ).toHaveAttribute("href", "/learn");
  });
});
