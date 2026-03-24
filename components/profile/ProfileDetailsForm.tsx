"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import type { Profile } from "@/types/profile";

type ProfileDetailsFormProps = {
  profile: Profile;
};

export function ProfileDetailsForm({ profile }: ProfileDetailsFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [savedName, setSavedName] = useState(profile.display_name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSaving(true);

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        display_name: displayName,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error ?? "Unable to update your profile right now.");
      setIsSaving(false);
      return;
    }

    setSavedName(displayName.trim());
    setMessage("Profile updated.");
    setIsSaving(false);
    router.refresh();
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
        Profile details
      </p>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm text-zinc-400">Display name</span>
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-orange-500/40"
            maxLength={50}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="How your account should appear"
            type="text"
            value={displayName}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
              Current display name
            </p>
            <p className="mt-2 text-sm text-zinc-200">
              {savedName || "Not set yet"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
              Email
            </p>
            <p className="mt-2 break-all text-sm text-zinc-200">
              {profile.email ?? "No email available"}
            </p>
          </div>
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
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "Saving..." : "Save profile"}
        </Button>
      </form>
    </section>
  );
}
