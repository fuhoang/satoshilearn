import { NextResponse } from "next/server";

import { createBillingPortalSessionForCurrentUser } from "@/lib/billing";
import { getStripe } from "@/lib/stripe";

function getStripePortalErrorResponse(error: unknown) {
  const type = typeof error === "object" && error !== null && "type" in error
    ? String((error as { type?: unknown }).type)
    : "";
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (type === "StripeRateLimitError") {
    return NextResponse.json(
      { error: "Stripe is rate limiting billing portal access right now. Please try again in a minute." },
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
    { error: "Unable to open billing portal right now." },
    { status: 502 },
  );
}

export async function POST() {
  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe billing is not configured." },
      { status: 500 },
    );
  }

  let portalUrl;

  try {
    portalUrl = await createBillingPortalSessionForCurrentUser();
  } catch (error) {
    return getStripePortalErrorResponse(error);
  }

  if (!portalUrl) {
    return NextResponse.json(
      { error: "Unable to open billing portal for this account." },
      { status: 401 },
    );
  }

  return NextResponse.json({ portalUrl });
}
