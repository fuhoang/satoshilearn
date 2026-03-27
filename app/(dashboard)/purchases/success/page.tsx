import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { getBillingContextForCurrentUser } from "@/lib/account-status";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Payment successful",
  description:
    "Your Blockwise payment was successful. Review your plan access and continue learning.",
  pathname: "/purchases/success",
  noIndex: true,
});

export default async function PurchaseSuccessPage() {
  noStore();

  const { accountStatus } = await getBillingContextForCurrentUser();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-8">
          <p className="text-sm uppercase tracking-[0.18em] text-emerald-200">
            Payment successful
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Your Blockwise plan is ready.
          </h1>
          <p className="mt-5 text-base leading-8 text-emerald-50/85 sm:text-lg">
            Your payment went through successfully. Your account now reflects
            your latest plan access, and you can jump straight back into
            learning.
          </p>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-sm text-zinc-500">Current access</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            {accountStatus.headline}
          </h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            {accountStatus.billingSummary}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href="/purchases"
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
            >
              Open billing hub
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Continue learning
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
