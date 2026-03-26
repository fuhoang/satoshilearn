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

export async function POST(request: Request) {
  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe billing is not configured yet." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as CheckoutBody;
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

  const billingContext = await ensureStripeCustomerForCurrentUser();

  if (!billingContext) {
    return NextResponse.json(
      { error: "You must be logged in to start checkout." },
      { status: 401 },
    );
  }

  const session = await stripe.checkout.sessions.create({
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

  return NextResponse.json({
    checkoutUrl: session.url,
  });
}
