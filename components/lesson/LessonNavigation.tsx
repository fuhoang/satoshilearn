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
        <Link
          href={`/learn/${previous.slug}`}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-white transition hover:bg-white/[0.05]"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Previous</p>
          <p className="mt-2 text-lg font-semibold">{previous.title}</p>
        </Link>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-white opacity-60">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Previous</p>
          <p className="mt-2 text-lg font-semibold">Start of course</p>
        </div>
      )}
      {next ? (
        <Link
          href={`/learn/${next.slug}`}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-right text-white transition hover:bg-white/[0.05]"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Next</p>
          <p className="mt-2 text-lg font-semibold">{next.title}</p>
        </Link>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-right text-white opacity-60">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Next</p>
          <p className="mt-2 text-lg font-semibold">Course complete</p>
        </div>
      )}
    </div>
  );
}
