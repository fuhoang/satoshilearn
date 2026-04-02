import { NextResponse } from "next/server";

import {
  ensureStripeCustomerForCurrentUser,
  getCancelUrl,
  getPlanDetails,
  getSuccessUrl,
} from "@/lib/billing";
import { getStripe } from "@/lib/stripe";

type CheckoutBody = {
  plan?: "pro_monthly" | "pro_yearly";
};

function getStripeCheckoutErrorResponse(error: unknown) {
  const type = typeof error === "object" && error !== null && "type" in error
    ? String((error as { type?: unknown }).type)
    : "";
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (type === "StripeRateLimitError") {
    return NextResponse.json(
      { error: "Stripe is rate limiting checkout right now. Please try again in a minute." },
      { status: 429 },
    );
  }

  if (type === "StripeAuthenticationError") {
    return NextResponse.json(
      { error: "Stripe billing is temporarily unavailable." },
      { status: 502 },
    );
  }

  if (
    type === "StripeAPIConnectionError" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    message.includes("network") ||
    message.includes("timeout")
  ) {
    return NextResponse.json(
      { error: "Unable to reach Stripe right now. Please try again shortly." },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { error: "Unable to start checkout right now." },
    { status: 502 },
  );
}

export async function POST(request: Request) {
  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe billing is not configured yet." },
      { status: 500 },
    );
  }

  let body: CheckoutBody;

  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json(
      { error: "Send a valid checkout request body." },
      { status: 400 },
    );
  }

  const plan = body.plan;

  if (plan !== "pro_monthly" && plan !== "pro_yearly") {
    return NextResponse.json(
      { error: "Choose a valid billing plan." },
      { status: 400 },
    );
  }

  const planDetails = getPlanDetails(plan);

  if (!planDetails) {
    return NextResponse.json(
      { error: "Stripe billing is not configured yet." },
      { status: 500 },
    );
  }

  let billingContext;

  try {
    billingContext = await ensureStripeCustomerForCurrentUser();
  } catch {
    return NextResponse.json(
      { error: "Unable to prepare checkout for this account right now." },
      { status: 503 },
    );
  }

  if (!billingContext) {
    return NextResponse.json(
      { error: "You must be logged in to start checkout." },
      { status: 401 },
    );
  }

  let session;

  try {
    session = await stripe.checkout.sessions.create({
      cancel_url: getCancelUrl(),
      customer: billingContext.customerId,
      line_items: [
        {
          price: planDetails.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        plan_slug: plan,
        user_id: billingContext.user.id,
      },
      mode: "subscription",
      success_url: getSuccessUrl(),
    });
  } catch (error) {
    return getStripeCheckoutErrorResponse(error);
  }

  if (!session.url) {
    return NextResponse.json(
      { error: "Unable to start checkout right now." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    checkoutUrl: session.url,
  });
}
