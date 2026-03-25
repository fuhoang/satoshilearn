import { render, screen } from "@testing-library/react";

import ProfilesPage from "@/app/(dashboard)/profiles/page";

const getOrCreateProfile = vi.fn();
const createServerSupabaseClient = vi.fn();

vi.mock("@/lib/profile", () => ({
  getOrCreateProfile: () => getOrCreateProfile(),
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
    expect(screen.getByText("Europe/London")).toBeInTheDocument();
    expect(
      screen.getByText("Learning Bitcoin from first principles."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("profile-details-form")).toBeInTheDocument();
    expect(screen.getByTestId("account-security-form")).toBeInTheDocument();
  });
});
