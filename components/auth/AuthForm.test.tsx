import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { AuthForm } from "@/components/auth/AuthForm";

const signInWithPassword = vi.fn();
const signInWithOAuth = vi.fn();
const resend = vi.fn();
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
    signInWithOAuth.mockReset();
    resend.mockReset();
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
        resend,
        signInWithOAuth,
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
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute(
      "href",
      "/auth/forgot-password",
    );
  });

  it("shows a success message after signup without a session", async () => {
    signUp.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    createBrowserSupabaseClient.mockReturnValue({
      auth: {
        resend,
        signInWithOAuth,
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
    expect(
      screen.getByRole("button", { name: "Resend confirmation email" }),
    ).toBeInTheDocument();
  });

  it("starts Google OAuth with the auth callback redirect", async () => {
    signInWithOAuth.mockResolvedValue({ error: null });
    createBrowserSupabaseClient.mockReturnValue({
      auth: {
        resend,
        signInWithOAuth,
      },
    });

    render(<AuthForm mode="login" nextPath="/learn" />);

    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledWith({
        options: {
          redirectTo: "http://localhost:3000/auth/callback?next=%2Flearn",
        },
        provider: "google",
      });
    });

    expect(
      screen.getByText("Redirecting to Google..."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).not.toBeDisabled();
  });

  it("shows the OAuth error and re-enables the form when Google sign-in fails", async () => {
    signInWithOAuth.mockResolvedValue({
      error: { message: "Provider is not configured" },
    });
    createBrowserSupabaseClient.mockReturnValue({
      auth: {
        resend,
        signInWithOAuth,
      },
    });

    render(<AuthForm mode="login" nextPath="/learn" />);

    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));

    expect(
      await screen.findByText("Provider is not configured"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).not.toBeDisabled();
  });

  it("sanitizes unsafe next paths before starting Google OAuth", async () => {
    signInWithOAuth.mockResolvedValue({ error: null });
    createBrowserSupabaseClient.mockReturnValue({
      auth: {
        resend,
        signInWithOAuth,
      },
    });

    render(<AuthForm mode="login" nextPath="https://evil.example" />);

    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledWith({
        options: {
          redirectTo: "http://localhost:3000/auth/callback?next=%2Flearn",
        },
        provider: "google",
      });
    });
  });

  it("shows resend confirmation after an unconfirmed login attempt", async () => {
    signInWithPassword.mockResolvedValue({
      error: { message: "Email not confirmed" },
    });
    createBrowserSupabaseClient.mockReturnValue({
      auth: {
        resend,
        signInWithOAuth,
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

    expect(await screen.findByText("Email not confirmed")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Resend confirmation email" }),
    ).toBeInTheDocument();
  });

  it("resends the confirmation email from the auth form", async () => {
    signUp.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    resend.mockResolvedValue({ error: null });
    createBrowserSupabaseClient.mockReturnValue({
      auth: {
        resend,
        signInWithOAuth,
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

    expect(
      await screen.findByRole("button", { name: "Resend confirmation email" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Resend confirmation email" }));

    await waitFor(() => {
      expect(resend).toHaveBeenCalledWith({
        email: "user@example.com",
        options: {
          emailRedirectTo: "http://localhost:3000/auth/callback?next=%2Flearn",
        },
        type: "signup",
      });
    });

    expect(await screen.findByText("Confirmation email sent.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again in 60s" })).toBeDisabled();
  });

  it("shows a friendly rate-limit message when resend is throttled", async () => {
    signUp.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    resend.mockResolvedValue({
      error: { message: "email rate limit exceeded" },
    });
    createBrowserSupabaseClient.mockReturnValue({
      auth: {
        resend,
        signInWithOAuth,
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

    expect(
      await screen.findByRole("button", { name: "Resend confirmation email" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Resend confirmation email" }));

    expect(
      await screen.findByText(
        "Too many email requests. Please wait a few minutes before trying again.",
      ),
    ).toBeInTheDocument();
  });
});
