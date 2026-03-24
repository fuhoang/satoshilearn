import { ProfileDetailsForm } from "@/components/profile/ProfileDetailsForm";
import { getOrCreateProfile } from "@/lib/profile";

export default async function ProfilesPage() {
  const profile = await getOrCreateProfile();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-sm text-zinc-500">Profile</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Your Satoshi Learn account
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            This page reflects the authenticated Supabase user linked to your
            lesson progress and future account settings.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-lg font-semibold text-white">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                    src={profile.avatar_url}
                  />
                ) : (
                  (profile.display_name || profile.email || "P")
                    .charAt(0)
                    .toUpperCase()
                )}
              </span>
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

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-300 lg:min-w-72">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Avatar source
              </p>
              <p className="mt-3 break-all leading-7">
                {profile.avatar_url ?? "Not set yet"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 border-t border-white/10 pt-8 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Timezone
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-200">
                {profile.timezone ?? "Not set yet"}
              </p>
            </div>

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
