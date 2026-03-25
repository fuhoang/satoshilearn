"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { buildAuthCallbackUrl } from "@/lib/auth-redirects";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setError("Supabase is not configured yet.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildAuthCallbackUrl(
        window.location.origin,
        "/auth/reset-password",
      ),
    });

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setMessage("Password reset email sent. Check your inbox for the secure link.");
    setIsSubmitting(false);
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-white">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
        Recovery
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Reset your password
      </h1>
      <p className="mt-4 text-sm leading-7 text-zinc-400">
        Enter the email tied to your Blockwise account and we will send you a
        secure reset link.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm text-zinc-400">Email</span>
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-orange-500/40"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

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
          className="w-full bg-orange-500 !text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Sending reset link..." : "Send reset link"}
        </Button>
      </form>
    </div>
  );
}
