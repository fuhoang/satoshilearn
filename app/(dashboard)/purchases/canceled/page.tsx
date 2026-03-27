import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { getBillingContextForCurrentUser } from "@/lib/account-status";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Payment not completed",
  description:
    "Your Blockwise payment was not completed. Return to billing to try again or continue learning on your current plan.",
  pathname: "/purchases/canceled",
  noIndex: true,
});

export default async function PurchaseCanceledPage() {
  noStore();

  const { accountStatus } = await getBillingContextForCurrentUser();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-8">
          <p className="text-sm uppercase tracking-[0.18em] text-amber-200">
            Payment not completed
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Your checkout was canceled.
          </h1>
          <p className="mt-5 text-base leading-8 text-amber-50/85 sm:text-lg">
            No payment was taken. Your current account access is unchanged, and
            you can come back to complete checkout whenever you are ready.
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
              Return to billing
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
