import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { homePricingPlans } from "@/components/home/homeData";

type HomePricingSectionProps = {
  currentPlanSlug: string | null;
};

export function HomePricingSection({
  currentPlanSlug,
}: HomePricingSectionProps) {
  return (
    <section id="pricing" className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm text-zinc-500">Why it matters</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Built for beginners who want clarity and safe guidance.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-zinc-400">
            Most people do not need more noise. They need a trusted place to
            learn crypto fundamentals, start with Bitcoin step by step, and avoid
            common mistakes.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          {homePricingPlans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <p className="text-sm text-zinc-500">{plan.name}</p>
              <p className="mt-3 text-4xl font-semibold text-white">
                {plan.price}
                <span className="text-base font-normal text-zinc-400">
                  {plan.cadence}
                </span>
              </p>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                {plan.description}
              </p>
              {isCurrentPlan(plan.plan, currentPlanSlug) ? (
                <span
                  aria-disabled="true"
                  className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-200 opacity-90"
                >
                  Current subscription
                </span>
              ) : (
                <CheckoutButton
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                  label={getPlanCtaLabel(plan.plan, currentPlanSlug, plan.cta)}
                  loadingLabel="Opening checkout..."
                  plan={plan.plan}
                />
              )}
              {plan.footnote ? (
                <p className="mt-3 text-center text-xs text-zinc-500">
                  {plan.footnote}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function isCurrentPlan(
  plan: "pro_monthly" | "pro_yearly",
  currentPlanSlug: string | null,
) {
  return currentPlanSlug === plan;
}

function getPlanCtaLabel(
  plan: "pro_monthly" | "pro_yearly",
  currentPlanSlug: string | null,
  fallback: string,
) {
  if (currentPlanSlug === "pro_yearly" && plan === "pro_monthly") {
    return "Downgrade to monthly";
  }

  if (currentPlanSlug === "pro_monthly" && plan === "pro_yearly") {
    return "Upgrade to yearly";
  }

  return fallback;
}
