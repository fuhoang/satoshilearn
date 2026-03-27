"use client";

import { useState } from "react";

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

  async function handleCheckout() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const payload = (await response.json()) as
        | { checkoutUrl?: string; error?: string }
        | undefined;

      if (response.status === 401) {
        window.location.assign(onUnauthorizedHref);
        return;
      }

      if (!response.ok || !payload?.checkoutUrl) {
        setIsLoading(false);
        return;
      }

      window.location.assign(payload.checkoutUrl);
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <button
      className={className}
      disabled={isLoading}
      onClick={() => void handleCheckout()}
      type="button"
    >
      {isLoading ? loadingLabel : label}
    </button>
  );
}
