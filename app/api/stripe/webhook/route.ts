import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  recordConversionEvent,
  markSubscriptionCanceled,
  recordPurchaseEvent,
  upsertSubscriptionFromStripe,
} from "@/lib/billing";
import { getStripe } from "@/lib/stripe";
import { getStripeServerEnv } from "@/lib/supabase/config";

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const subscription = invoice.parent?.subscription_details?.subscription;

  return typeof subscription === "string" ? subscription : null;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const env = getStripeServerEnv();

  if (!stripe || !env?.webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.webhookSecret,
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await recordPurchaseEvent({
        amountCents: session.amount_total,
        currency: session.currency,
        eventType: event.type,
        status: session.payment_status,
        stripeCheckoutSessionId: session.id,
        stripeCustomerId:
          typeof session.customer === "string" ? session.customer : null,
        subscriptionId:
          typeof session.subscription === "string" ? session.subscription : null,
      });
      await recordConversionEvent({
        eventType: "checkout_complete",
        plan:
          session.metadata?.plan_slug === "pro_monthly" ||
          session.metadata?.plan_slug === "pro_yearly"
            ? session.metadata.plan_slug
            : null,
        source: "stripe_webhook",
        stripeCustomerId:
          typeof session.customer === "string" ? session.customer : null,
        targetSlug: "/purchases",
        targetTitle:
          session.metadata?.plan_slug === "pro_yearly"
            ? "Completed Pro yearly checkout"
            : "Completed Pro monthly checkout",
      });
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      await upsertSubscriptionFromStripe(
        event.data.object as Stripe.Subscription,
      );
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await markSubscriptionCanceled(subscription.id);
      break;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await recordPurchaseEvent({
        amountCents: invoice.amount_paid ?? invoice.amount_due,
        currency: invoice.currency,
        eventType: event.type,
        status: invoice.status,
        stripeCustomerId:
          typeof invoice.customer === "string" ? invoice.customer : null,
        stripeInvoiceId: invoice.id,
        subscriptionId: getInvoiceSubscriptionId(invoice),
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
