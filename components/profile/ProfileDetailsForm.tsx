"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import type { Profile } from "@/types/profile";

type ProfileDetailsFormProps = {
  profile: Profile;
};

const TIMEZONE_OPTIONS = [
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
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [avatarUrlToDelete, setAvatarUrlToDelete] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [timezone, setTimezone] = useState(profile.timezone ?? "");
  const [savedName, setSavedName] = useState(profile.display_name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

  const avatarPreviewUrl = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
    [avatarFile],
  );

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const activeAvatarUrl = avatarPreviewUrl ?? avatarUrl;
  const hasAvatar = Boolean(avatarUrl.trim() || avatarPreviewUrl);
  const avatarSizeLabel = avatarFile
    ? `${(avatarFile.size / 1024 / 1024).toFixed(2)} MB`
    : null;

  async function deleteAvatar(avatarToDelete: string) {
    await fetch("/api/profile/avatar", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        avatarUrl: avatarToDelete,
      }),
    });
  }

  async function handleRemoveAvatar() {
    if (!avatarUrl.trim()) {
      setAvatarFile(null);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
      setAvatarUrlToDelete(null);
      setMessage("Avatar cleared from the form.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsRemovingAvatar(true);
    setAvatarUrlToDelete(avatarUrl);
    setAvatarUrl("");
    setAvatarFile(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
    setMessage("Avatar will be removed when you save your profile.");
    setIsRemovingAvatar(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSaving(true);

    const previousAvatarUrl = avatarUrlToDelete ?? avatarUrl;
    let nextAvatarUrl = avatarUrl;

    if (avatarFile) {
      const uploadFormData = new FormData();
      uploadFormData.set("file", avatarFile);

      const uploadResponse = await fetch("/api/profile/avatar", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const payload = (await uploadResponse.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(payload?.error ?? "Unable to upload your avatar right now.");
        setIsSaving(false);
        return;
      }

      const payload = (await uploadResponse.json()) as { avatarUrl?: string };
      nextAvatarUrl = payload.avatarUrl ?? "";
      setMessage("Avatar uploaded. Finishing your profile update...");
    }

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        avatar_url: nextAvatarUrl,
        bio,
        display_name: displayName,
        timezone,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (nextAvatarUrl && nextAvatarUrl !== previousAvatarUrl) {
        void deleteAvatar(nextAvatarUrl);
      }
      setError(payload?.error ?? "Unable to update your profile right now.");
      setIsSaving(false);
      return;
    }

    const payload = (await response.json()) as { profile?: Profile };
    const nextProfile = payload.profile ?? profile;

    setDisplayName(nextProfile.display_name ?? "");
    setAvatarUrl(nextProfile.avatar_url ?? "");
    setAvatarUrlToDelete(null);
    setAvatarFile(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
    setBio(nextProfile.bio ?? "");
    setTimezone(nextProfile.timezone ?? "");
    setSavedName(nextProfile.display_name ?? "");
    setMessage("Profile updated.");
    setIsSaving(false);
    if (previousAvatarUrl && previousAvatarUrl !== nextProfile.avatar_url) {
      void deleteAvatar(previousAvatarUrl);
    }
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
              {TIMEZONE_OPTIONS.map((timezoneOption) => (
                <option key={timezoneOption} value={timezoneOption}>
                  {timezoneOption}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm text-zinc-400">Avatar image</span>
          <input
            accept="image/png,image/jpeg,image/webp"
            aria-label="Avatar image"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none file:mr-3 file:rounded-full file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-orange-400"
            ref={avatarInputRef}
            onChange={(event) =>
              setAvatarFile(event.target.files?.[0] ?? null)
            }
            type="file"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Upload a JPG, PNG, or WebP image up to 2MB.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
            <span className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-base font-semibold text-white">
              {activeAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="Profile avatar preview"
                  className="h-full w-full object-cover"
                  src={activeAvatarUrl}
                />
              ) : (
                (savedName || profile.email || "P").charAt(0).toUpperCase()
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-200">
                {avatarFile
                  ? `Selected: ${avatarFile.name}`
                  : avatarUrl.trim()
                    ? "Current profile avatar"
                    : "No avatar uploaded"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {avatarFile
                  ? "Save your profile to upload this new image."
                  : avatarUrl.trim()
                    ? "Replace it with another file, or remove it below."
                    : "Upload a square image for the cleanest result."}
              </p>
              {avatarFile ? (
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-orange-300">
                  Pending upload {avatarSizeLabel ? `· ${avatarSizeLabel}` : ""}
                </p>
              ) : null}
            </div>
            {hasAvatar ? (
              <Button
                className="border border-white/10 bg-white !text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isRemovingAvatar || isSaving}
                onClick={handleRemoveAvatar}
                type="button"
                variant="secondary"
              >
                {isRemovingAvatar ? "Removing..." : "Remove avatar"}
              </Button>
            ) : null}
          </div>
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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

        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="bg-orange-500 !text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            disabled={isSaving}
            type="submit"
          >
            {isSaving
              ? avatarFile
                ? "Uploading avatar..."
                : "Saving..."
              : avatarFile
                ? "Upload avatar and save"
                : "Save profile"}
          </Button>
          {avatarFile ? (
            <button
              className="text-sm font-medium text-zinc-400 transition hover:text-white"
              onClick={() => {
                setAvatarFile(null);
                if (avatarInputRef.current) {
                  avatarInputRef.current.value = "";
                }
              }}
              type="button"
            >
              Clear selected file
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
