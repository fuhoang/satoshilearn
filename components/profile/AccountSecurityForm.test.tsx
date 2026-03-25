import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AccountSecurityForm } from "@/components/profile/AccountSecurityForm";

const resend = vi.fn();
const updateUser = vi.fn();
const createBrowserSupabaseClient = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createBrowserSupabaseClient: () => createBrowserSupabaseClient(),
}));

describe("AccountSecurityForm", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    resend.mockReset();
    updateUser.mockReset();
    createBrowserSupabaseClient.mockReset();
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        origin: "http://localhost:3000",
      },
      writable: true,
    });
    createBrowserSupabaseClient.mockReturnValue({
      auth: {
        resend,
        updateUser,
      },
    });
  });

  afterAll(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("updates the password when both entries match", async () => {
    updateUser.mockResolvedValue({ error: null });

    render(
      <AccountSecurityForm
        email="user@example.com"
        isEmailConfirmed
      />,
    );

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith({
        password: "password123",
      });
    });

    expect(await screen.findByText("Password updated.")).toBeInTheDocument();
  });

  it("shows a validation error when password confirmation does not match", async () => {
    render(
      <AccountSecurityForm
        email="user@example.com"
        isEmailConfirmed
      />,
    );

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "different123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    expect(
      await screen.findByText("Your password confirmation does not match."),
    ).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("resends the confirmation email when the account is unconfirmed", async () => {
    resend.mockResolvedValue({ error: null });

    render(
      <AccountSecurityForm
        email="user@example.com"
        isEmailConfirmed={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Resend confirmation email" }));

    await waitFor(() => {
      expect(resend).toHaveBeenCalledWith({
        email: "user@example.com",
        options: {
          emailRedirectTo: "http://localhost:3000/auth/callback?next=%2Fprofiles",
        },
        type: "signup",
      });
    });

    expect(await screen.findByText("Confirmation email sent.")).toBeInTheDocument();
  });
});
