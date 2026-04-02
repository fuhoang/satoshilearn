import Link from "next/link";
import type { ReactNode } from "react";

import FuzzyText from "@/components/FuzzyText";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type FallbackPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  details?: string;
  actions?: ReactNode;
  className?: string;
  fuzzyEyebrow?: boolean;
};

export function FallbackPage({
  actions,
  className,
  description,
  details,
  eyebrow,
  fuzzyEyebrow = false,
  title,
}: FallbackPageProps) {
  return (
    <main
      className={cn(
        "min-h-[calc(100vh-9rem)] bg-black px-6 py-16 text-white sm:py-20 lg:py-24",
        className,
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-center">
        <div className="w-full rounded-[2.75rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:p-12 lg:p-16">
          <div
            className={cn(
              fuzzyEyebrow
                ? "mb-2 flex justify-center"
                : "text-xs uppercase tracking-[0.22em] text-zinc-500",
            )}
          >
            {fuzzyEyebrow ? (
              <FuzzyText
                baseIntensity={0.12}
                className="h-[8rem] w-full max-w-[18rem] sm:h-[11rem] sm:max-w-[26rem] lg:h-[15rem] lg:max-w-[36rem]"
                enableHover
                fontSize="clamp(9rem, 22vw, 18rem)"
                fontWeight={900}
                fuzzRange={24}
                hoverIntensity={0.42}
              >
                {eyebrow}
              </FuzzyText>
            ) : (
              eyebrow
            )}
          </div>
          <h1 className="mx-auto mt-5 max-w-2xl text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-base leading-7 text-zinc-300 sm:text-lg">
            {description}
          </p>
          {details ? (
            <p className="mx-auto mt-4 max-w-2xl rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-center text-sm text-zinc-400">
              {details}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {actions ?? (
              <>
                <Link
                  className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-700/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-strong)]"
                  href="/"
                >
                  Back to home
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-100 transition-transform duration-200 hover:-translate-y-0.5 hover:border-amber-400/60 hover:bg-amber-500/20"
                  href="/learn"
                >
                  Explore lessons
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

type RetryActionProps = {
  onRetry: () => void;
};

export function RetryAction({ onRetry }: RetryActionProps) {
  return (
    <Button onClick={onRetry} type="button">
      Try again
    </Button>
  );
}
