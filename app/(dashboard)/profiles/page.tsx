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

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Email
            </p>
            <p className="mt-3 break-all text-lg font-medium text-white">
              {profile.email ?? "No email available"}
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Profile ID
            </p>
            <p className="mt-3 break-all text-sm leading-7 text-zinc-300">
              {profile.id}
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Created
            </p>
            <p className="mt-3 text-lg font-medium text-white">
              {new Date(profile.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </section>

        <ProfileDetailsForm profile={profile} />

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            What comes next
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
            <p>Profile rows are now created on demand from your authenticated user.</p>
            <p>Next iterations can add display name, avatar, and account settings.</p>
            <p>Subscription state and richer learning analytics can hang off this profile.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
