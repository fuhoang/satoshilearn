import type Stripe from "stripe";
import { unstable_noStore as noStore } from "next/cache";

import { absoluteUrl } from "@/lib/seo";
import { getProfileSummary } from "@/lib/profile";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeServerEnv } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripePriceMap } from "@/lib/stripe";
import type {
  BillingPlanSlug,
  BillingSnapshot,
  BillingStatus,
  PurchaseEventRecord,
  SubscriptionRecord,
} from "@/types/billing";

export type AccountStatus = {
  billingSummary: string;
  billingStatus: string;
  canManageBilling: boolean;
  checkoutCtaLabel: string;
  ctaHref: "/purchases";
  ctaLabel: string;
  headline: string;
  includedFeatures: string[];
  upcomingFeatures: string[];
  nextStep: string;
  planLabel: string;
  planSummary: string;
};

const FREE_FEATURES = [
  "Bitcoin curriculum access",
  "Quiz progress and dashboard history",
  "Authenticated profile and account recovery",
];

const PRO_FEATURES = [
  "Everything in the free plan",
  "Priority access to premium tracks and future modules",
  "Expanded tutor usage and billing history",
];

const UPCOMING_FEATURES = [
  "Priority learning tracks and future premium modules",
  "Billing history, invoices, and plan management",
  "Expanded tutor access and premium account insights",
];

const PRO_ACCESS_STATUSES: BillingStatus[] = ["active", "trialing", "past_due"];
const FREE_TUTOR_REQUEST_LIMIT = 10;
const PRO_TUTOR_REQUEST_LIMIT = 30;

function toIsoTimestamp(value: number | null | undefined) {
  return typeof value === "number" ? new Date(value * 1000).toISOString() : null;
}

function getSubscriptionPeriodBounds(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];

  return {
    currentPeriodStart: toIsoTimestamp(item?.current_period_start),
    currentPeriodEnd: toIsoTimestamp(item?.current_period_end),
  };
}

export function getDefaultBillingSnapshot(): BillingSnapshot {
  return {
    configured: Boolean(getStripeServerEnv()),
    customerId: null,
    purchaseEvents: [],
    subscription: null,
  };
}

export function hasProAccess(snapshot: BillingSnapshot) {
  return Boolean(
    snapshot.subscription &&
      PRO_ACCESS_STATUSES.includes(snapshot.subscription.status),
  );
}

export function getTutorRequestLimit(snapshot: BillingSnapshot) {
  return hasProAccess(snapshot)
    ? PRO_TUTOR_REQUEST_LIMIT
    : FREE_TUTOR_REQUEST_LIMIT;
}

export function getAccountStatus(snapshot: BillingSnapshot): AccountStatus {
  if (!snapshot.configured) {
    return {
      billingSummary: "Billing is not configured in this environment yet.",
      billingStatus: "Billing not configured",
      canManageBilling: false,
      checkoutCtaLabel: "Set up Stripe first",
      ctaHref: "/purchases",
      ctaLabel: "Open billing hub",
      headline: "Free plan",
      includedFeatures: FREE_FEATURES,
      upcomingFeatures: UPCOMING_FEATURES,
      nextStep: "Add Stripe environment variables to enable checkout, subscriptions, and invoice history.",
      planLabel: "Free",
      planSummary:
        "You can access the full live Bitcoin curriculum, quizzes, dashboard history, and account tools on the free plan today.",
    };
  }

  if (!snapshot.subscription) {
    return {
      billingSummary: "Free access is active for your account.",
      billingStatus: "No active subscription",
      canManageBilling: true,
      checkoutCtaLabel: "Upgrade to Pro",
      ctaHref: "/purchases",
      ctaLabel: "Open billing hub",
      headline: "Free plan",
      includedFeatures: FREE_FEATURES,
      upcomingFeatures: UPCOMING_FEATURES,
      nextStep: "Choose a Pro plan to unlock future premium tracks, invoice history, and expanded tutor access.",
      planLabel: "Free",
      planSummary:
        "You can access the full live Bitcoin curriculum, quizzes, dashboard history, and account tools on the free plan today.",
    };
  }

  const isYearly = snapshot.subscription.plan_slug === "pro_yearly";
  const periodEnd = snapshot.subscription.current_period_end
    ? new Date(snapshot.subscription.current_period_end).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;
  const statusLabel =
    snapshot.subscription.status === "trialing"
      ? "Trial active"
      : snapshot.subscription.status === "past_due"
        ? "Payment issue"
        : snapshot.subscription.cancel_at_period_end
          ? "Cancels at period end"
          : "Active subscription";

  return {
    billingSummary: periodEnd
      ? `${isYearly ? "Pro yearly" : "Pro monthly"} is active${snapshot.subscription.cancel_at_period_end ? " and will end" : " through"} ${periodEnd}.`
      : `${isYearly ? "Pro yearly" : "Pro monthly"} is active for your account.`,
    billingStatus: statusLabel,
    canManageBilling: true,
    checkoutCtaLabel: snapshot.subscription.cancel_at_period_end
      ? "Resume with a new plan"
      : "Change plan",
    ctaHref: "/purchases",
    ctaLabel: "Open billing hub",
    headline: isYearly ? "Pro yearly" : "Pro monthly",
    includedFeatures: PRO_FEATURES,
    upcomingFeatures: snapshot.subscription.cancel_at_period_end
      ? ["Subscription remains active until the current billing period ends."]
      : ["More premium tracks and usage controls will build on this plan."],
    nextStep: snapshot.subscription.cancel_at_period_end
      ? "Reactivate with a new checkout session before the current billing period ends if you want uninterrupted access."
      : "Use the billing hub to review renewals, payment history, and plan options.",
    planLabel: "Pro",
    planSummary:
      "Your account has Pro billing access, including future premium tracks, stronger tutor access, and purchase history in the billing hub.",
  };
}

export async function getBillingSnapshotForCurrentUser(): Promise<BillingSnapshot> {
  noStore();

  const supabase = await createServerSupabaseClient();
  const admin = createSupabaseAdminClient();

  if (!supabase || !admin) {
    return getDefaultBillingSnapshot();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return getDefaultBillingSnapshot();
  }

  const [{ data: profile }, { data: subscription }, { data: purchaseEvents }] =
    await Promise.all([
      admin.from("profiles").select("stripe_customer_id").eq("id", user.id).single(),
      admin
        .from("subscriptions")
        .select(
          "user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, plan_slug, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at",
        )
        .eq("user_id", user.id)
        .maybeSingle(),
      admin
        .from("purchase_events")
        .select(
          "id, user_id, subscription_id, stripe_invoice_id, stripe_checkout_session_id, event_type, amount_cents, currency, status, created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  return {
    configured: Boolean(getStripeServerEnv()),
    customerId: profile?.stripe_customer_id ?? null,
    purchaseEvents: (purchaseEvents ?? []) as PurchaseEventRecord[],
    subscription: (subscription ?? null) as SubscriptionRecord | null,
  };
}

export async function getAccountStatusForCurrentUser() {
  return getAccountStatus(await getBillingSnapshotForCurrentUser());
}

export async function hasProAccessForCurrentUser() {
  return hasProAccess(await getBillingSnapshotForCurrentUser());
}

export async function getBillingContextForCurrentUser() {
  const [{ profile }, snapshot] = await Promise.all([
    getProfileSummary(),
    getBillingSnapshotForCurrentUser(),
  ]);

  return {
    accountStatus: getAccountStatus(snapshot),
    billingSnapshot: snapshot,
    profile,
    priceMap: getStripePriceMap(),
  };
}

export function getSuccessUrl(path = "/purchases/success") {
  return absoluteUrl(path);
}

export function getCancelUrl(path = "/purchases/canceled") {
  return absoluteUrl(path);
}

export function getPortalReturnUrl(path = "/purchases") {
  return absoluteUrl(path);
}

export async function ensureStripeCustomerForCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const admin = createSupabaseAdminClient();
  const stripe = (await import("@/lib/stripe")).getStripe();

  if (!supabase || !admin || !stripe) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id, email, display_name")
    .eq("id", user.id)
    .single();

  if (profile?.stripe_customer_id) {
    return {
      customerId: profile.stripe_customer_id,
      user,
    };
  }

  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    metadata: {
      user_id: user.id,
    },
    name: profile?.display_name ?? undefined,
  });

  await admin
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", user.id);

  return {
    customerId: customer.id,
    user,
  };
}

export async function createBillingPortalSessionForCurrentUser() {
  const stripe = (await import("@/lib/stripe")).getStripe();
  const customer = await ensureStripeCustomerForCurrentUser();

  if (!stripe || !customer) {
    return null;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.customerId,
    return_url: getPortalReturnUrl(),
  });

  return session.url;
}

export function getPlanDetails(plan: BillingPlanSlug) {
  const priceMap = getStripePriceMap();

  if (!priceMap) {
    return null;
  }

  if (plan === "pro_monthly") {
    return {
      label: "Pro monthly",
      priceId: priceMap.pro_monthly,
    };
  }

  if (plan === "pro_yearly") {
    return {
      label: "Pro yearly",
      priceId: priceMap.pro_yearly,
    };
  }

  return null;
}

export async function upsertSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  customerId?: string,
) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return;
  }

  const resolvedCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : customerId ?? null;

  if (!resolvedCustomerId) {
    return;
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", resolvedCustomerId)
    .maybeSingle();

  if (!profile) {
    return;
  }

  const priceMap = getStripePriceMap();
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const { currentPeriodStart, currentPeriodEnd } =
    getSubscriptionPeriodBounds(subscription);
  const planSlug: BillingPlanSlug =
    priceMap?.pro_yearly === priceId
      ? "pro_yearly"
      : priceMap?.pro_monthly === priceId
        ? "pro_monthly"
        : "free";

  await admin.from("subscriptions").upsert(
    {
      user_id: profile.id,
      stripe_customer_id: resolvedCustomerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan_slug: planSlug,
      status: subscription.status as BillingStatus,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    },
    { onConflict: "user_id" },
  );
}

export async function markSubscriptionCanceled(subscriptionId: string) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return;
  }

  await admin
    .from("subscriptions")
    .update({
      status: "canceled",
      cancel_at_period_end: true,
    })
    .eq("stripe_subscription_id", subscriptionId);
}

export async function recordPurchaseEvent(input: {
  amountCents?: number | null;
  currency?: string | null;
  eventType: string;
  status?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripeCustomerId?: string | null;
  stripeInvoiceId?: string | null;
  subscriptionId?: string | null;
}) {
  const admin = createSupabaseAdminClient();

  if (!admin || !input.stripeCustomerId) {
    return;
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", input.stripeCustomerId)
    .maybeSingle();

  if (!profile) {
    return;
  }

  await admin.from("purchase_events").insert({
    amount_cents: input.amountCents ?? null,
    currency: input.currency ?? null,
    event_type: input.eventType,
    status: input.status ?? null,
    stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
    stripe_invoice_id: input.stripeInvoiceId ?? null,
    subscription_id: input.subscriptionId ?? null,
    user_id: profile.id,
  });
}

export async function recordConversionEvent(input: {
  eventType: "checkout_complete";
  plan?: BillingPlanSlug | null;
  source: string;
  stripeCustomerId?: string | null;
  targetSlug: string;
  targetTitle: string;
}) {
  const admin = createSupabaseAdminClient();

  if (!admin || !input.stripeCustomerId) {
    return;
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", input.stripeCustomerId)
    .maybeSingle();

  if (!profile) {
    return;
  }

  await admin.from("learning_activity").insert({
    activity_context: JSON.stringify({
      eventType: input.eventType,
      plan:
        input.plan === "pro_monthly" || input.plan === "pro_yearly"
          ? input.plan
          : null,
      source: input.source,
    }),
    activity_type: "conversion_event",
    created_at: new Date().toISOString(),
    lesson_slug: input.targetSlug,
    lesson_title: input.targetTitle,
    user_id: profile.id,
  });
}
