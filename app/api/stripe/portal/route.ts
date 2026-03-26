import { NextResponse } from "next/server";

import { createBillingPortalSessionForCurrentUser } from "@/lib/billing";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe billing is not configured." },
      { status: 500 },
    );
  }

  const portalUrl = await createBillingPortalSessionForCurrentUser();

  if (!portalUrl) {
    return NextResponse.json(
      { error: "Unable to open billing portal for this account." },
      { status: 401 },
    );
  }

  return NextResponse.json({ portalUrl });
}
