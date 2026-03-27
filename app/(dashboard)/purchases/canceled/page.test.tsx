import { render, screen } from "@testing-library/react";

import PurchaseCanceledPage from "@/app/(dashboard)/purchases/canceled/page";

const getBillingContextForCurrentUser = vi.fn();

vi.mock("@/lib/account-status", () => ({
  getBillingContextForCurrentUser: () => getBillingContextForCurrentUser(),
}));

describe("purchase canceled page", () => {
  it("renders the canceled state with billing and learning links", async () => {
    getBillingContextForCurrentUser.mockResolvedValue({
      accountStatus: {
        billingSummary: "Free access is active for your account.",
        billingStatus: "No active subscription",
        canManageBilling: true,
        checkoutCtaLabel: "Upgrade to Pro",
        ctaHref: "/purchases",
        ctaLabel: "Open billing hub",
        headline: "Free plan",
        includedFeatures: [],
        nextStep: "Choose a Pro plan to unlock more.",
        planLabel: "Free",
        planSummary: "Free summary",
        upcomingFeatures: [],
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

    const page = await PurchaseCanceledPage();

    render(page);

    expect(
      screen.getByRole("heading", { level: 1, name: "Your checkout was canceled." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Free plan")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Return to billing" }),
    ).toHaveAttribute("href", "/purchases");
    expect(
      screen.getByRole("link", { name: "Continue learning" }),
    ).toHaveAttribute("href", "/learn");
  });
});
