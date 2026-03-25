import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

const updateUser = vi.fn();
const createBrowserSupabaseClient = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createBrowserSupabaseClient: () => createBrowserSupabaseClient(),
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    updateUser.mockReset();
    createBrowserSupabaseClient.mockReset();
    createBrowserSupabaseClient.mockReturnValue({
      auth: {
        updateUser,
      },
    });
  });

  it("updates the password after a recovery flow", async () => {
    updateUser.mockResolvedValue({ error: null });

    render(<ResetPasswordForm />);

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

    expect(
      await screen.findByText("Password updated. You can now log in with your new password."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to login" })).toHaveAttribute(
      "href",
      "/auth/login",
    );
  });
});
