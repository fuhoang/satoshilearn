"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import type { Profile } from "@/types/profile";

type ProfileDetailsFormProps = {
  profile: Profile;
};

const FALLBACK_TIMEZONES = [
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

export function ProfileDetailsForm({ profile }: ProfileDetailsFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [timezone, setTimezone] = useState(profile.timezone ?? "");
  const [savedName, setSavedName] = useState(profile.display_name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const timezones = useMemo(() => {
    const supportedValuesOf = Intl.supportedValuesOf as
      | ((key: "timeZone") => string[])
      | undefined;

    if (typeof supportedValuesOf === "function") {
      return supportedValuesOf("timeZone");
    }

    return FALLBACK_TIMEZONES;
  }, []);

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
        avatar_url: avatarUrl,
        bio,
        display_name: displayName,
        timezone,
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

    const payload = (await response.json()) as { profile?: Profile };
    const nextProfile = payload.profile ?? profile;

    setDisplayName(nextProfile.display_name ?? "");
    setAvatarUrl(nextProfile.avatar_url ?? "");
    setBio(nextProfile.bio ?? "");
    setTimezone(nextProfile.timezone ?? "");
    setSavedName(nextProfile.display_name ?? "");
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
        <div className="grid gap-5 md:grid-cols-2">
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

          <label className="block">
            <span className="text-sm text-zinc-400">Timezone</span>
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-orange-500/40"
              onChange={(event) => setTimezone(event.target.value)}
              value={timezone}
            >
              <option value="">Select a timezone</option>
              {timezones.map((timezoneOption) => (
                <option key={timezoneOption} value={timezoneOption}>
                  {timezoneOption}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm text-zinc-400">Avatar URL</span>
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-orange-500/40"
            maxLength={500}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://example.com/avatar.jpg"
            type="url"
            value={avatarUrl}
          />
        </label>

        <label className="block">
          <span className="text-sm text-zinc-400">Bio</span>
          <textarea
            className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-orange-500/40"
            maxLength={240}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Tell us how you want to approach learning Bitcoin."
            value={bio}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              Timezone
            </p>
            <p className="mt-2 text-sm text-zinc-200">
              {timezone.trim() || "Not set yet"}
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
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
              Avatar
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white">
                {avatarUrl.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="Profile avatar preview"
                    className="h-full w-full object-cover"
                    src={avatarUrl}
                  />
                ) : (
                  (savedName || profile.email || "P").charAt(0).toUpperCase()
                )}
              </span>
              <p className="min-w-0 text-sm text-zinc-200">
                {avatarUrl.trim() || "Not set yet"}
              </p>
            </div>
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
