"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { useLearningHistory } from "@/hooks/useLearningHistory";

export function ProFeatureGate({
  eyebrow,
  source,
  targetSlug,
  targetTitle,
  title,
  description,
}: {
  eyebrow: string;
  source: string;
  targetSlug: string;
  targetTitle: string;
  title: string;
  description: string;
}) {
  const { recordConversionEvent } = useLearningHistory();
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    if (hasTrackedViewRef.current) {
      return;
    }

    hasTrackedViewRef.current = true;
    recordConversionEvent({
      eventType: "locked_view",
      source,
      targetSlug,
      targetTitle,
    });
  }, [recordConversionEvent, source, targetSlug, targetTitle]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <section className="rounded-[2rem] border border-orange-500/20 bg-orange-500/10 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-orange-300">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-orange-100/80 sm:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/purchases"
              onClick={() =>
                recordConversionEvent({
                  eventType: "upgrade_click",
                  source,
                  targetSlug,
                  targetTitle,
                })
              }
              className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400 sm:w-auto"
            >
              Upgrade to Pro
            </Link>
            <Link
              href="/learn"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Back to curriculum
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
