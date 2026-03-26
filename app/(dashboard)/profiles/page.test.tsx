import { render, screen } from "@testing-library/react";

import ProfilesPage from "@/app/(dashboard)/profiles/page";

const getOrCreateProfile = vi.fn();
const getAccountStatusForCurrentUser = vi.fn();
const createServerSupabaseClient = vi.fn();

vi.mock("@/lib/profile", () => ({
  getOrCreateProfile: () => getOrCreateProfile(),
}));

vi.mock("@/lib/account-status", () => ({
  getAccountStatusForCurrentUser: () => getAccountStatusForCurrentUser(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => createServerSupabaseClient(),
}));

vi.mock("@/components/profile/ProfileDetailsForm", () => ({
  ProfileDetailsForm: ({
    profile,
  }: {
    profile: { display_name: string | null; timezone: string | null };
  }) => (
    <div data-testid="profile-details-form">
      {profile.display_name ?? "No display name"}
      {profile.timezone ?? "No timezone"}
    </div>
  ),
}));

vi.mock("@/components/profile/AccountSecurityForm", () => ({
  AccountSecurityForm: ({
    email,
    isEmailConfirmed,
  }: {
    email: string | null;
    isEmailConfirmed: boolean;
  }) => (
    <div data-testid="account-security-form">
      {email ?? "No email"}
      {isEmailConfirmed ? "confirmed" : "pending"}
    </div>
  ),
}));

describe("profiles page route", () => {
  it("renders the consolidated profile summary and edit form", async () => {
    getAccountStatusForCurrentUser.mockResolvedValue({
      headline: "Free plan",
      billingSummary: "Free access is active for your account.",
      includedFeatures: ["Bitcoin curriculum access"],
      nextStep: "Choose a Pro plan to unlock more.",
      upcomingFeatures: ["Priority learning tracks and future premium modules"],
      ctaHref: "/purchases",
      ctaLabel: "Open billing hub",
      billingStatus: "No active subscription",
      canManageBilling: true,
      checkoutCtaLabel: "Upgrade to Pro",
      planLabel: "Free",
      planSummary: "Free plan summary",
    });
    createServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser: async () => ({
          data: {
            user: {
              email_confirmed_at: "2026-03-24T00:00:00.000Z",
            },
          },
        }),
      },
    });
    getOrCreateProfile.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      display_name: "Satoshi",
      avatar_url: "https://example.com/avatar.png",
      bio: "Learning Bitcoin from first principles.",
      timezone: "Europe/London",
      created_at: "2026-03-24T00:00:00.000Z",
    });

    const page = await ProfilesPage();

    render(page);

    expect(screen.getByText("Your BlockWise account")).toBeInTheDocument();
    expect(screen.getByText("Satoshi")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByTestId("profile-details-form")).toHaveTextContent(
      "Europe/London",
    );
    expect(
      screen.getByText("Learning Bitcoin from first principles."),
    ).toBeInTheDocument();
    expect(screen.getByText("Plan and access")).toBeInTheDocument();
    expect(screen.getByText("Free plan")).toBeInTheDocument();
    expect(screen.getByTestId("profile-details-form")).toBeInTheDocument();
    expect(screen.getByTestId("account-security-form")).toBeInTheDocument();
  });
});
