import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ProfileDetailsForm } from "@/components/profile/ProfileDetailsForm";

const refresh = vi.fn();
const fetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh,
  }),
}));

describe("ProfileDetailsForm", () => {
  const profile = {
    id: "user-1",
    email: "user@example.com",
    display_name: "Satoshi",
    avatar_url: null,
    bio: null,
    timezone: "Europe/London",
    created_at: "2026-03-24T00:00:00.000Z",
  };

  beforeEach(() => {
    refresh.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("renders the current profile fields", () => {
    render(<ProfileDetailsForm profile={profile} />);

    expect(screen.getByDisplayValue("Satoshi")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Europe/London")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
  });

  it("submits the edited profile and refreshes the route", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          profile: {
            ...profile,
            display_name: "Nakamoto",
            avatar_url:
              "https://project.supabase.co/storage/v1/object/public/avatars/user-1/avatar.png",
            bio: "Bitcoin learner",
            timezone: "America/New_York",
          },
        }),
        { status: 200 },
      ),
    );

    render(<ProfileDetailsForm profile={profile} />);

    fireEvent.change(screen.getByLabelText("Display name"), {
      target: { value: "Nakamoto" },
    });
    fireEvent.change(screen.getByLabelText("Timezone"), {
      target: { value: "America/New_York" },
    });
    fireEvent.change(screen.getByLabelText("Bio"), {
      target: { value: "Bitcoin learner" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/profile", {
        body: JSON.stringify({
          avatar_url: "",
          bio: "Bitcoin learner",
          display_name: "Nakamoto",
          timezone: "America/New_York",
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
    });

    expect(await screen.findByText("Profile updated.")).toBeInTheDocument();
    expect(refresh).toHaveBeenCalled();
  });

  it("shows the API error message when save fails", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Your Supabase profiles table is missing the latest profile fields.",
        }),
        { status: 500 },
      ),
    );

    render(<ProfileDetailsForm profile={profile} />);

    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    expect(
      await screen.findByText(
        "Your Supabase profiles table is missing the latest profile fields.",
      ),
    ).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("uploads a selected avatar before saving the profile", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            avatarUrl:
              "https://project.supabase.co/storage/v1/object/public/avatars/user-1/avatar.png",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            profile: {
              ...profile,
              avatar_url:
                "https://project.supabase.co/storage/v1/object/public/avatars/user-1/avatar.png",
            },
          }),
          { status: 200 },
        ),
      );

    render(<ProfileDetailsForm profile={profile} />);

    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Avatar image"), {
      target: { files: [file] },
    });
    expect(screen.getByText(/Pending upload/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Upload avatar and save" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Upload avatar and save" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "/api/profile/avatar",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        }),
      );
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/profile",
      expect.objectContaining({
        body: JSON.stringify({
          avatar_url:
            "https://project.supabase.co/storage/v1/object/public/avatars/user-1/avatar.png",
          bio: "",
          display_name: "Satoshi",
          timezone: "Europe/London",
        }),
      }),
    );
  });

  it("cleans up a newly uploaded avatar if the profile save fails", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            avatarUrl:
              "https://project.supabase.co/storage/v1/object/public/avatars/user-1/avatar.png",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: "Unable to update your profile right now.",
          }),
          { status: 500 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ removed: true }), { status: 200 }),
      );

    render(<ProfileDetailsForm profile={profile} />);

    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Avatar image"), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Upload avatar and save" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        "/api/profile/avatar",
        expect.objectContaining({
          method: "DELETE",
          body: JSON.stringify({
            avatarUrl:
              "https://project.supabase.co/storage/v1/object/public/avatars/user-1/avatar.png",
          }),
        }),
      );
    });
  });

  it("removes the current avatar before saving the profile", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            profile: {
              ...profile,
              avatar_url: null,
            },
          }),
          { status: 200 },
        ),
      );

    render(
      <ProfileDetailsForm
        profile={{
          ...profile,
          avatar_url:
            "https://project.supabase.co/storage/v1/object/public/avatars/user-1/avatar.png",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove avatar" }));

    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "/api/profile",
        expect.objectContaining({
          body: JSON.stringify({
            avatar_url: "",
            bio: "",
            display_name: "Satoshi",
            timezone: "Europe/London",
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "/api/profile/avatar",
        expect.objectContaining({
          method: "DELETE",
          body: JSON.stringify({
            avatarUrl:
              "https://project.supabase.co/storage/v1/object/public/avatars/user-1/avatar.png",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );
    });
  });

  it("clears a selected avatar file before upload", () => {
    render(<ProfileDetailsForm profile={profile} />);

    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Avatar image"), {
      target: { files: [file] },
    });

    expect(screen.getByText("Selected: avatar.png")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear selected file" }));

    expect(screen.queryByText("Selected: avatar.png")).not.toBeInTheDocument();
  });
});
