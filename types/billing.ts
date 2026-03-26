export type BillingPlanSlug = "free" | "pro_monthly" | "pro_yearly";

export type BillingStatus =
  | "inactive"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete";

export interface SubscriptionRecord {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan_slug: BillingPlanSlug;
  status: BillingStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseEventRecord {
  id: string;
  user_id: string;
  subscription_id: string | null;
  stripe_invoice_id: string | null;
  stripe_checkout_session_id: string | null;
  event_type: string;
  amount_cents: number | null;
  currency: string | null;
  status: string | null;
  created_at: string;
}

export interface BillingSnapshot {
  configured: boolean;
  customerId: string | null;
  purchaseEvents: PurchaseEventRecord[];
  subscription: SubscriptionRecord | null;
}
