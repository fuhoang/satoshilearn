import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import PricingPage from "@/app/(marketing)/pricing/page";

const getBillingSnapshotForCurrentUser = vi.fn();
const hasProAccess = vi.fn();

vi.mock("@/components/billing/CheckoutButton", () => ({
  CheckoutButton: ({
    label,
  }: {
    label: string;
  }) => <button type="button">{label}</button>,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/billing", () => ({
  getBillingSnapshotForCurrentUser: () => getBillingSnapshotForCurrentUser(),
  hasProAccess: (snapshot: unknown) => hasProAccess(snapshot),
}));

describe("pricing page", () => {
  beforeEach(() => {
    getBillingSnapshotForCurrentUser.mockReset();
    hasProAccess.mockReset();
  });

  it("disables the monthly CTA when the user is already on Pro monthly", async () => {
    const snapshot = {
      configured: true,
      customerId: "cus_123",
      purchaseEvents: [],
      subscription: {
        plan_slug: "pro_monthly",
      },
    };

    getBillingSnapshotForCurrentUser.mockResolvedValue(snapshot);
    hasProAccess.mockReturnValue(true);

    const page = await PricingPage();

    render(page);

    expect(screen.getByText("Current subscription")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Upgrade to yearly" }),
    ).toBeInTheDocument();
  });

  it("shows a downgrade CTA for monthly when the user is on Pro yearly", async () => {
    const snapshot = {
      configured: true,
      customerId: "cus_123",
      purchaseEvents: [],
      subscription: {
        plan_slug: "pro_yearly",
      },
    };

    getBillingSnapshotForCurrentUser.mockResolvedValue(snapshot);
    hasProAccess.mockReturnValue(true);

    const page = await PricingPage();

    render(page);

    expect(
      screen.getByRole("button", { name: "Downgrade to monthly" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Current subscription")).toBeInTheDocument();
  });

  it("keeps paid CTAs active when the user is not on a matching subscription", async () => {
    getBillingSnapshotForCurrentUser.mockResolvedValue({
      configured: true,
      customerId: null,
      purchaseEvents: [],
      subscription: null,
    });
    hasProAccess.mockReturnValue(false);

    const page = await PricingPage();

    render(page);

    expect(screen.getByRole("button", { name: "Upgrade to Pro" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose yearly" })).toBeInTheDocument();
  });
});
