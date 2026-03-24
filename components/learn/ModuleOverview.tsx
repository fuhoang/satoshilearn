"use client";

import Link from "next/link";

import type { ModuleMeta } from "@/types/lesson";

import { useLessonProgress } from "@/hooks/useLessonProgress";

type ModuleOverviewProps = {
  module: ModuleMeta;
};

export default function ModuleOverview({ module }: ModuleOverviewProps) {
  const { isLessonCompleted, loaded } = useLessonProgress();
  const completedCount = module.lessons.filter((lesson) =>
    isLessonCompleted(lesson.slug),
  ).length;

  const nextLesson =
    module.lessons.find((lesson, index) => {
      if (index === 0) {
        return !isLessonCompleted(lesson.slug);
      }

      return (
        isLessonCompleted(module.lessons[index - 1].slug) &&
        !isLessonCompleted(lesson.slug)
      );
    }) ?? module.lessons[module.lessons.length - 1];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Link
            href="/learn"
            className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Back to curriculum
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-orange-300">
              Module {String(module.order).padStart(2, "0")}
            </span>
            <span>
              {loaded
                ? `${completedCount} of ${module.lessons.length} lessons completed`
                : "Syncing progress..."}
            </span>
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {module.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
            {module.description}
          </p>
          <div className="mt-8">
            <Link
              href={`/learn/${nextLesson.slug}`}
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
            >
              {completedCount === 0
                ? "Start module"
                : completedCount === module.lessons.length
                  ? "Review module"
                  : "Continue module"}
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-4">
            {module.lessons.map((lesson, index) => {
              const completed = isLessonCompleted(lesson.slug);
              const unlocked =
                index === 0 || isLessonCompleted(module.lessons[index - 1].slug);

              return (
                <div
                  key={lesson.slug}
                  className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Lesson {String(index + 1).padStart(2, "0")}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                          !loaded
                            ? "border border-white/10 bg-black/40 text-zinc-500"
                            : completed
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : unlocked
                              ? "border border-white/10 bg-white/[0.04] text-zinc-300"
                              : "border border-white/10 bg-black/40 text-zinc-500"
                        }`}
                      >
                        {!loaded
                          ? "Syncing"
                          : completed
                            ? "Completed"
                            : unlocked
                              ? "Unlocked"
                              : "Locked"}
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                      {lesson.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                      {lesson.summary}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span className="text-sm text-zinc-500">{lesson.duration}</span>
                    {unlocked ? (
                      <Link
                        href={`/learn/${lesson.slug}`}
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
                      >
                        {completed ? "Review lesson" : "Open lesson"}
                      </Link>
                    ) : (
                      <div className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-500">
                        Finish the previous lesson
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
