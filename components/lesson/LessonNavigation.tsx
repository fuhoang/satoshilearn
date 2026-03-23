import Link from "next/link";

import type { LessonMeta } from "@/types/lesson";

type LessonNavigationProps = {
  previous: LessonMeta | null;
  next: LessonMeta | null;
};

export function LessonNavigation({
  previous,
  next,
}: LessonNavigationProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {previous ? (
        <Link href={`/learn/${previous.slug}`} className="surface rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Previous</p>
          <p className="mt-2 text-lg font-semibold">{previous.title}</p>
        </Link>
      ) : (
        <div className="surface rounded-3xl p-5 opacity-60">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Previous</p>
          <p className="mt-2 text-lg font-semibold">Start of course</p>
        </div>
      )}
      {next ? (
        <Link href={`/learn/${next.slug}`} className="surface rounded-3xl p-5 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Next</p>
          <p className="mt-2 text-lg font-semibold">{next.title}</p>
        </Link>
      ) : (
        <div className="surface rounded-3xl p-5 text-right opacity-60">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Next</p>
          <p className="mt-2 text-lg font-semibold">Course complete</p>
        </div>
      )}
    </div>
  );
}
