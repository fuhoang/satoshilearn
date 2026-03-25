import type { Metadata } from "next";

import { AccountSecurityForm } from "@/components/profile/AccountSecurityForm";
import { ProfileDetailsForm } from "@/components/profile/ProfileDetailsForm";
import { getAccountStatus } from "@/lib/account-status";
import { getOrCreateProfile } from "@/lib/profile";
import { createPageMetadata } from "@/lib/seo";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = createPageMetadata({
  title: "Profile",
  description: "Manage your Blockwise profile, avatar, account security, and plan access.",
  pathname: "/profiles",
  noIndex: true,
});

export default async function ProfilesPage() {
  const profile = await getOrCreateProfile();
  const accountStatus = getAccountStatus();
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-sm text-zinc-500">Profile</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Your BlockWise account
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            This page reflects the authenticated Supabase user linked to your
            lesson progress and future account settings.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5 text-lg font-semibold text-white">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="Profile avatar"
                    className="absolute inset-0 h-full w-full object-cover"
                    src={profile.avatar_url}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    {(profile.display_name || profile.email || "P")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Account overview
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  {profile.display_name ?? "No display name yet"}
                </h2>
                <p className="mt-3 break-all text-sm leading-7 text-zinc-300">
                  {profile.email ?? "No email available"}
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-zinc-300">
                  {profile.bio ??
                    "Add a short note about how you want to learn Bitcoin, what pace suits you, or what you are focused on next."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 border-t border-white/10 pt-8 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Created
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-200">
                {new Date(profile.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Profile ID
              </p>
              <p className="mt-3 break-all text-sm leading-7 text-zinc-200">
                {profile.id}
              </p>
            </div>
          </div>
        </section>

        <ProfileDetailsForm profile={profile} />
        <AccountSecurityForm
          email={profile.email}
          isEmailConfirmed={Boolean(user?.email_confirmed_at)}
        />

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Plan and access
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_0.9fr]">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-lg font-semibold text-white">{accountStatus.headline}</p>
              <p className="mt-2 text-sm leading-7 text-zinc-300">
                {accountStatus.billingSummary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {accountStatus.includedFeatures.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-sm font-semibold text-white">Billing hub</p>
              <p className="mt-2 text-sm leading-7 text-zinc-300">
                {accountStatus.nextStep}
              </p>
              <div className="mt-4 space-y-2">
                {accountStatus.upcomingFeatures.slice(0, 2).map((feature) => (
                  <p
                    key={feature}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300"
                  >
                    {feature}
                  </p>
                ))}
              </div>
              <a
                className="mt-4 inline-flex text-sm font-semibold text-orange-300"
                href={accountStatus.ctaHref}
              >
                {accountStatus.ctaLabel}
              </a>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            What comes next
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
            <p>Profile rows now sync automatically when you sign in or confirm your account.</p>
            <p>Next iterations can add avatar, richer account settings, and notification preferences.</p>
            <p>Subscription state and richer learning analytics can hang off this profile.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
