import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { AuthForm } from "@/components/auth/AuthForm";

const signInWithPassword = vi.fn();
const signUp = vi.fn();
const createBrowserSupabaseClient = vi.fn();
const hasSupabaseEnv = vi.fn();
const fetchMock = vi.fn();

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

vi.mock("@/lib/supabase/client", () => ({
  createBrowserSupabaseClient: () => createBrowserSupabaseClient(),
}));

vi.mock("@/lib/supabase/config", () => ({
  hasSupabaseEnv: () => hasSupabaseEnv(),
}));

describe("AuthForm", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    signInWithPassword.mockReset();
    signUp.mockReset();
    createBrowserSupabaseClient.mockReset();
    hasSupabaseEnv.mockReset();
    fetchMock.mockReset();
    hasSupabaseEnv.mockReturnValue(true);
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        assign: vi.fn(),
        origin: "http://localhost:3000",
      },
      writable: true,
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("shows a configuration warning when Supabase env is missing", () => {
    hasSupabaseEnv.mockReturnValue(false);
    createBrowserSupabaseClient.mockReturnValue(null);

    render(<AuthForm mode="login" nextPath="/learn" />);

    expect(
      screen.getByText(/Supabase is not configured yet/i),
    ).toBeInTheDocument();
  });

  it("logs in and redirects to the requested path", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    createBrowserSupabaseClient.mockReturnValue({
      auth: {
        signInWithPassword,
      },
    });

    render(<AuthForm mode="login" nextPath="/learn" />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/profile/sync", {
      credentials: "include",
      method: "POST",
    });
    expect(window.location.assign).toHaveBeenCalledWith("/learn");
  });

  it("shows a success message after signup without a session", async () => {
    signUp.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    createBrowserSupabaseClient.mockReturnValue({
      auth: {
        signUp,
      },
    });

    render(<AuthForm mode="register" nextPath="/learn" />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalled();
    });

    expect(
      screen.getByText(/Check your email to confirm your address/i),
    ).toBeInTheDocument();
  });
});
