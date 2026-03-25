"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setError("Supabase is not configured yet.");
      return;
    }

    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your password confirmation does not match.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    setMessage("Password updated. You can now log in with your new password.");
    setPassword("");
    setConfirmPassword("");
    setIsSubmitting(false);
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-white">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
        Recovery
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Choose a new password
      </h1>
      <p className="mt-4 text-sm leading-7 text-zinc-400">
        Set a fresh password for your Blockwise account after opening the reset
        link from your email.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm text-zinc-400">New password</span>
          <input
            autoComplete="new-password"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-orange-500/40"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        <label className="block">
          <span className="text-sm text-zinc-400">Confirm password</span>
          <input
            autoComplete="new-password"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-orange-500/40"
            minLength={8}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
        </label>

        {error ? (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            <p>{message}</p>
            <Link
              className="mt-3 inline-flex font-medium text-emerald-50 underline"
              href="/auth/login"
            >
              Return to login
            </Link>
          </div>
        ) : null}

        <Button
          className="w-full bg-orange-500 !text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Updating password..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
