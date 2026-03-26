export function getSupabaseBrowserEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return {
    url,
    anonKey,
  };
}

export function hasSupabaseEnv() {
  return getSupabaseBrowserEnv() !== null;
}

export function getSupabaseServiceRoleEnv() {
  const browserEnv = getSupabaseBrowserEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!browserEnv || !serviceRoleKey) {
    return null;
  }

  return {
    url: browserEnv.url,
    serviceRoleKey,
  };
}

export function getStripeServerEnv() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const monthlyPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const yearlyPriceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID;

  if (!secretKey || !monthlyPriceId || !yearlyPriceId) {
    return null;
  }

  return {
    secretKey,
    webhookSecret: webhookSecret ?? null,
    monthlyPriceId,
    yearlyPriceId,
  };
}
