"use client";

import { useLearningHistory } from "@/hooks/useLearningHistory";
import { getLearningAnalytics } from "@/lib/learning-history";

export function UpgradeFunnel() {
  const {
    conversionEvents,
    lessonCompletions,
    quizAttempts,
    tutorPrompts,
  } = useLearningHistory();
  const analytics = getLearningAnalytics({
    conversionEvents,
    lessonCompletions,
    quizAttempts,
    tutorPrompts,
  });

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
        Upgrade funnel
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Locked views"
          value={String(analytics.lockedViewCount)}
          helper="Direct visits to locked Pro lessons and modules"
        />
        <Metric
          label="Upgrade clicks"
          value={String(analytics.upgradeClickCount)}
          helper="Clicks on Pro upgrade CTAs"
        />
        <Metric
          label="Checkout starts"
          value={String(analytics.checkoutStartCount)}
          helper="Hosted Stripe checkout launches"
        />
        <Metric
          label="Checkout completions"
          value={String(analytics.checkoutCompletionCount)}
          helper="Successful Pro purchases synced back"
        />
      </div>
    </section>
  );
}

function Metric({
  helper,
  label,
  value,
}: {
  helper: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{helper}</p>
    </div>
  );
}
