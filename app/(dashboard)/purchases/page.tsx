import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { BillingActions } from "@/components/purchases/BillingActions";
import { UpgradeFunnel } from "@/components/purchases/UpgradeFunnel";
import { moduleConfig } from "@/content/config";
import { getBillingContextForCurrentUser } from "@/lib/account-status";
import { createPageMetadata } from "@/lib/seo";
import type { PurchaseEventRecord } from "@/types/billing";

export const metadata: Metadata = createPageMetadata({
  title: "Purchases",
  description: "View your Blockwise plan access, billing hub, and future purchase history.",
  pathname: "/purchases",
  noIndex: true,
});

export default async function PurchasesPage() {
  noStore();

  const { accountStatus, billingSnapshot, profile, priceMap } =
    await getBillingContextForCurrentUser();
  const purchaseCount = billingSnapshot.purchaseEvents.length;
  const premiumModules = moduleConfig.filter((module) => module.requiresPro);
  const tutorLimit = accountStatus.planLabel === "Pro" ? 30 : 10;
  const subscription = billingSnapshot.subscription;
  const latestInvoicePaid = billingSnapshot.purchaseEvents.find(
    (event) => event.event_type === "invoice.paid",
  );
  const renewalLabel = subscription?.current_period_end
    ? formatDate(subscription.current_period_end)
    : "Not available";
  const startedLabel = subscription?.current_period_start
    ? formatDate(subscription.current_period_start)
    : "Not available";
  const planCadenceLabel =
    subscription?.plan_slug === "pro_yearly"
      ? "Yearly billing"
      : subscription?.plan_slug === "pro_monthly"
        ? "Monthly billing"
        : "Free access";
  const invoiceSummary =
    latestInvoicePaid && latestInvoicePaid.amount_cents !== null && latestInvoicePaid.currency
      ? `${formatMoney(latestInvoicePaid.amount_cents, latestInvoicePaid.currency)} paid ${formatDate(latestInvoicePaid.created_at)}`
      : purchaseCount > 0
        ? "Billing activity recorded on this account"
        : "No invoice paid yet";
  const subscriptionTimeline = subscription
    ? [
        {
          label: "Plan started",
          value: startedLabel,
          helper: subscription.current_period_start
            ? "Current subscription cycle start"
            : "Start date unavailable",
        },
        {
          label: subscription.cancel_at_period_end ? "Access ends" : "Next renewal",
          value: renewalLabel,
          helper: subscription.cancel_at_period_end
            ? "Your Pro access stays active until this date"
            : "Stripe will renew your subscription on this date",
        },
        {
          label: "Billing cadence",
          value: planCadenceLabel,
          helper:
            subscription.plan_slug === "pro_yearly"
              ? "One invoice per year"
              : "One invoice per month",
        },
        {
          label: "Latest invoice",
          value: invoiceSummary,
          helper:
            latestInvoicePaid?.status === "paid"
              ? "Most recent paid Stripe invoice"
              : "Invoice activity will appear after successful billing events",
        },
      ]
    : [
        {
          label: "Current access",
          value: "Free plan",
          helper: "No active recurring subscription yet",
        },
        {
          label: "Upgrade path",
          value: "Monthly or yearly Pro",
          helper: "Choose a plan below to unlock premium access",
        },
      ];

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-sm text-zinc-500">Purchases</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Subscription and purchase history
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            This is the billing hub for your Blockwise account. It reflects your
            current access level, current subscription state, and recent Stripe
            purchase events.
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
                {profile.display_name || profile.email || "Profile"}
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
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {subscriptionTimeline.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                    {item.label}
                  </p>
                  <p className="mt-3 text-sm font-medium text-white">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{item.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Billing actions
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                <p>
                  {purchaseCount > 0
                    ? `${purchaseCount} recent Stripe event${purchaseCount === 1 ? "" : "s"} recorded for this account.`
                    : "No purchases are linked to this account yet."}
                </p>
                <p>{accountStatus.nextStep}</p>
              </div>
              <div className="mt-5">
                <BillingActions
                  canCheckout={Boolean(priceMap)}
                  canOpenPortal={Boolean(billingSnapshot.customerId)}
                  checkoutLabel={accountStatus.checkoutCtaLabel}
                />
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                  What this plan includes
                </p>
                <div className="mt-3 space-y-2 text-sm text-zinc-200">
                  <p>{tutorLimit} tutor requests per minute</p>
                  <p>
                    {accountStatus.planLabel === "Pro"
                      ? `${premiumModules.length} premium modules unlocked`
                      : `${premiumModules.length} premium modules available with Pro`}
                  </p>
                </div>
              </div>
              {subscription ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                    Billing timeline
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-zinc-200">
                    <p>
                      {subscription.cancel_at_period_end
                        ? `Cancellation is scheduled. Pro access remains active until ${renewalLabel}.`
                        : `Your ${planCadenceLabel.toLowerCase()} renews on ${renewalLabel}.`}
                    </p>
                    <p>
                      {latestInvoicePaid
                        ? `Latest paid invoice: ${invoiceSummary}.`
                        : "Recent paid invoices will appear here once Stripe records them."}
                    </p>
                  </div>
                </div>
              ) : null}
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
                Premium modules
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {premiumModules.map((module) => (
                  <div
                    key={module.slug}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-200"
                  >
                    <p className="font-medium text-white">{module.title}</p>
                    <p className="mt-1 text-zinc-400">{module.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Recent billing events
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {billingSnapshot.purchaseEvents.length > 0 ? (
                  billingSnapshot.purchaseEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-200"
                    >
                      <p className="font-medium text-white">
                        {formatEventLabel(event.event_type)}
                      </p>
                      <p className="mt-1 text-zinc-400">
                        {event.amount_cents !== null && event.currency
                          ? formatMoney(event.amount_cents, event.currency)
                          : "Amount unavailable"}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        {formatDate(event.created_at)}
                      </p>
                      {event.status ? (
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">
                          {event.status}
                        </p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </section>
          </div>
        </section>

        <UpgradeFunnel />
      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(amountCents: number, currency: string) {
  return `${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

function formatEventLabel(eventType: PurchaseEventRecord["event_type"]) {
  return eventType
    .split(".")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
