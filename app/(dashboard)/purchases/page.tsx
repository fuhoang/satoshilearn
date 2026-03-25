import type { Metadata } from "next";
import Link from "next/link";

import { getAccountStatus } from "@/lib/account-status";
import { getProfileSummary } from "@/lib/profile";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Purchases",
  description: "View your Blockwise plan access, billing hub, and future purchase history.",
  pathname: "/purchases",
  noIndex: true,
});

export default async function PurchasesPage() {
  const accountStatus = getAccountStatus();
  const { label } = await getProfileSummary();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-sm text-zinc-500">Purchases</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Subscription and purchase history
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            This is the billing hub for your Blockwise account. It already reflects your current access level and will hold invoices, renewals, and upgrades once subscriptions are connected.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Current plan
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              {accountStatus.headline}
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              {accountStatus.billingSummary}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-300">
                {accountStatus.planLabel}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">
                {label}
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {accountStatus.includedFeatures.map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-200"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Plan roadmap
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                <p>No purchases are linked to this account yet.</p>
                <p>{accountStatus.nextStep}</p>
              </div>
              <div className="mt-5 space-y-3">
                {accountStatus.upcomingFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-200"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Account links
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                  href="/profiles"
                >
                  Open profile settings
                </Link>
                <Link
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                  href="/dashboard"
                >
                  Back to dashboard
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
