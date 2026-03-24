"use client";

import Link from "next/link";

import type { Lesson, ModuleMeta } from "@/types/lesson";

import { useLessonProgress } from "@/hooks/useLessonProgress";
import { getCompletedModuleLessonCount } from "@/lib/module-progress";

type LessonHeaderProps = {
  lesson: Lesson;
  module: ModuleMeta | null;
  moduleLessonIndex: number;
};

export function LessonHeader({
  lesson,
  module,
  moduleLessonIndex,
}: LessonHeaderProps) {
  const { completedLessonSlugs, loaded } = useLessonProgress();
  const completedInModule = module
    ? getCompletedModuleLessonCount(module, completedLessonSlugs)
    : 0;

  return (
    <header className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-white">
      <Link
        href="/learn"
        className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-400 transition hover:bg-white/5 hover:text-white"
      >
        Back to curriculum
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
        {lesson.section ? (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-zinc-300">
            {lesson.section}
          </span>
        ) : null}
        <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-orange-300">
          Lesson {lesson.order}
        </span>
        <span>{lesson.duration}</span>
      </div>
      <div className="mt-5 grid gap-4 rounded-3xl border border-white/10 bg-black/30 p-5 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Lesson position
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-200">
            {module
              ? `Lesson ${moduleLessonIndex + 1} of ${module.lessons.length}`
              : `Lesson ${lesson.order}`}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Module progress
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-200">
            {module
              ? loaded
                ? `${completedInModule} of ${module.lessons.length} completed`
                : "Syncing progress..."
              : "Standalone lesson"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Continue path
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-200">
            Finish the lesson, review the quiz, then move on.
          </p>
        </div>
      </div>
      <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
        {lesson.title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
        {lesson.summary}
      </p>
    </header>
  );
}
