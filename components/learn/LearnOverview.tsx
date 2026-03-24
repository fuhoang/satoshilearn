"use client";

import Link from "next/link";

import type { ModuleMeta } from "@/types/lesson";

import { useLessonProgress } from "@/hooks/useLessonProgress";

type LearnOverviewProps = {
  modules: ModuleMeta[];
  totalLessons: number;
};

export function LearnOverview({
  modules,
  totalLessons,
}: LearnOverviewProps) {
  const { completedCount, isLessonCompleted, loaded } = useLessonProgress();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-sm text-zinc-500">Curriculum</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Start learning Bitcoin step by step.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            A simple learning path for beginners who want clear explanations,
            steady progress, and a better understanding of Bitcoin.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-sm text-zinc-400">Progress</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {loaded
                  ? `${completedCount} of ${totalLessons} lessons completed`
                  : "Syncing progress..."}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-sm text-zinc-400">Level</p>
              <p className="mt-1 text-lg font-semibold text-white">Beginner</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {modules.map((module) => {
              const moduleCompletedCount = module.lessons.filter((lesson) =>
                isLessonCompleted(lesson.slug),
              ).length;

              return (
                <article
                  key={module.slug}
                  className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <p className="text-sm text-zinc-500">
                    Module {String(module.order).padStart(2, "0")}
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                    {module.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {module.description}
                  </p>
                  <div className="mt-6 space-y-2">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                      {loaded
                        ? `${moduleCompletedCount} of ${module.lessons.length} lessons completed`
                        : "Syncing progress..."}
                    </p>
                  </div>
                  <div className="mt-6 space-y-3">
                    {module.lessons.map((lesson, index) => {
                      const completed = isLessonCompleted(lesson.slug);

                      return (
                        <div
                          key={lesson.slug}
                          className="rounded-2xl border border-white/10 px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                                Lesson {String(index + 1).padStart(2, "0")}
                              </p>
                              <p className="mt-2 text-sm font-medium text-zinc-200">
                                {lesson.title}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                                !loaded
                                  ? "border border-white/10 bg-black/40 text-zinc-500"
                                  : completed
                                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border border-white/10 bg-white/[0.04] text-zinc-400"
                              }`}
                            >
                              {!loaded ? "Syncing" : completed ? "Completed" : "Pending"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-auto pt-8">
                    <Link
                      href={`/learn/module/${module.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
                    >
                      Open module
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-sm text-zinc-500">Ready to begin?</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Start with the first lesson.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-zinc-400">
              The best place to begin is with the basics. Build a strong
              foundation first, then move deeper as you go.
            </p>
            <Link
              href="/learn/what-is-money"
              className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
            >
              Open &ldquo;What is Money?&rdquo;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
