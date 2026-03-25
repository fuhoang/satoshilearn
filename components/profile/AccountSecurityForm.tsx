"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { buildAuthCallbackUrl } from "@/lib/auth-redirects";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AccountSecurityFormProps = {
  email: string | null;
  isEmailConfirmed: boolean;
};

export function AccountSecurityForm({
  email,
  isEmailConfirmed,
}: AccountSecurityFormProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);

  async function handlePasswordUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setError("Supabase is not configured yet.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Choose a password with at least 8 characters.");
      setMessage(null);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your password confirmation does not match.");
      setMessage(null);
      return;
    }

    setError(null);
    setMessage(null);
    setIsUpdatingPassword(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setIsUpdatingPassword(false);
      return;
    }

    setMessage("Password updated.");
    setNewPassword("");
    setConfirmPassword("");
    setIsUpdatingPassword(false);
  }

  async function handleResendConfirmation() {
    if (!supabase) {
      setError("Supabase is not configured yet.");
      return;
    }

    if (!email) {
      setError("No account email is available for confirmation.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsResendingConfirmation(true);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: buildAuthCallbackUrl(window.location.origin, "/profiles"),
      },
    });

    if (resendError) {
      setError(resendError.message);
      setIsResendingConfirmation(false);
      return;
    }

    setMessage("Confirmation email sent.");
    setIsResendingConfirmation(false);
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
        Account security
      </p>
      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form className="space-y-5" onSubmit={handlePasswordUpdate}>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Change your password
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
              Update the password tied to your Blockwise account without leaving
              the app.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm text-zinc-400">New password</span>
              <input
                autoComplete="new-password"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-orange-500/40"
                minLength={8}
                onChange={(event) => setNewPassword(event.target.value)}
                type="password"
                value={newPassword}
              />
            </label>

            <label className="block">
              <span className="text-sm text-zinc-400">Confirm password</span>
              <input
                autoComplete="new-password"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-orange-500/40"
                minLength={8}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                value={confirmPassword}
              />
            </label>
          </div>

          {error ? (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {message}
            </p>
          ) : null}

          <Button
            className="bg-orange-500 !text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            disabled={isUpdatingPassword}
            type="submit"
          >
            {isUpdatingPassword ? "Updating password..." : "Update password"}
          </Button>
        </form>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Email confirmation
          </p>
          <p className="mt-3 text-lg font-semibold text-white">
            {isEmailConfirmed ? "Confirmed" : "Pending confirmation"}
          </p>
          <p className="mt-3 text-sm leading-7 text-zinc-300">
            {isEmailConfirmed
              ? "Your email is already confirmed and ready for security-sensitive actions."
              : "Resend the confirmation email if you have not verified this account yet."}
          </p>
          <p className="mt-3 break-all text-sm text-zinc-400">
            {email ?? "No account email available"}
          </p>
          {!isEmailConfirmed ? (
            <Button
              className="mt-5 w-full bg-white text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              disabled={isResendingConfirmation}
              onClick={handleResendConfirmation}
              type="button"
              variant="secondary"
            >
              {isResendingConfirmation
                ? "Sending confirmation..."
                : "Resend confirmation email"}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
