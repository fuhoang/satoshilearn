"use client";

import { useState } from "react";

import { getApiErrorMessage, getNetworkErrorMessage } from "@/lib/client-api";

type CheckoutButtonProps = {
  className: string;
  label: string;
  loadingLabel?: string;
  onUnauthorizedHref?: string;
  plan: "pro_monthly" | "pro_yearly";
};

export function CheckoutButton({
  className,
  label,
  loadingLabel = "Opening checkout...",
  onUnauthorizedHref = "/auth/login",
  plan,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const payload = (await response.clone().json().catch(() => null)) as
        | { checkoutUrl?: string }
        | null;

      if (response.status === 401) {
        window.location.assign(onUnauthorizedHref);
        return;
      }

      if (!response.ok || !payload?.checkoutUrl) {
        setError(await getApiErrorMessage(response, {
          badRequestMessage: "Please double-check your billing choice and try again.",
          fallbackMessage: "Unable to start checkout right now.",
          networkMessage: "We couldn't reach billing right now. Please try again shortly.",
          rateLimitMessage:
            "Billing is busy right now. Please wait a minute and try again.",
          unauthorizedMessage: "Log in to continue to checkout.",
          unavailableMessage:
            "Billing is temporarily unavailable. Please try again shortly.",
        }));
        setIsLoading(false);
        return;
      }

      window.location.assign(payload.checkoutUrl);
    } catch {
      setError(getNetworkErrorMessage({
        fallbackMessage: "Unable to start checkout right now.",
        networkMessage: "We couldn't reach billing right now. Please try again shortly.",
        unavailableMessage:
          "Billing is temporarily unavailable. Please try again shortly.",
      }));
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        className={className}
        disabled={isLoading}
        onClick={() => void handleCheckout()}
        type="button"
      >
        {isLoading ? loadingLabel : label}
      </button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
