"use client";

import Link from "next/link";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { ProgressBar } from "@/components/lesson/ProgressBar";
import { QuizCard } from "@/components/quiz/QuizCard";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import {
  getCompletedModuleLessonCount,
  getCurrentModule,
  getModuleCompletionPercentage,
  getNextModuleLesson,
} from "@/lib/module-progress";
import type { ModuleMeta, TrackMeta } from "@/types/lesson";

type DashboardOverviewProps = {
  currentTrack: TrackMeta;
  modules: ModuleMeta[];
  profileLabel: string;
  totalLessons: number;
};

export function DashboardOverview({
  currentTrack,
  modules,
  profileLabel,
  totalLessons,
}: DashboardOverviewProps) {
  const { completedCount, completedLessonSlugs, loaded } = useLessonProgress();
  const currentModule = getCurrentModule(modules, completedLessonSlugs);
  const nextLesson = currentModule
    ? getNextModuleLesson(currentModule, completedLessonSlugs)
    : null;
  const overallProgress = totalLessons
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;
  const currentModuleCompletedCount = currentModule
    ? getCompletedModuleLessonCount(currentModule, completedLessonSlugs)
    : 0;
  const currentModuleProgress = currentModule
    ? getModuleCompletionPercentage(currentModule, completedLessonSlugs)
    : 0;
  const completedModules = modules.filter(
    (module) =>
      getCompletedModuleLessonCount(module, completedLessonSlugs) ===
      module.lessons.length,
  ).length;

  return (
    <div className="space-y-8">
      <section className="surface rounded-[2rem] p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
            Dashboard
          </span>
          <span className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {currentTrack.title} track
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Keep building your {currentTrack.title} foundation
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">
          Pick up your next lesson, monitor module progress, and keep your account
          details in one place.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <SummaryCard
            label="Completed lessons"
            value={
              loaded
                ? `${completedCount} / ${totalLessons}`
                : "Syncing..."
            }
            helper="Across the current track"
          />
          <SummaryCard
            label="Completed modules"
            value={loaded ? `${completedModules} / ${modules.length}` : "Syncing..."}
            helper="Fully finished modules"
          />
          <SummaryCard
            label="Current module"
            value={currentModule?.title ?? "No module yet"}
            helper={
              currentModule
                ? `${currentModuleCompletedCount} of ${currentModule.lessons.length} lessons complete`
                : "Start the curriculum to begin"
            }
          />
          <SummaryCard
            label="Account"
            value={profileLabel}
            helper="Free access for now"
          />
        </div>
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between text-sm text-[var(--muted)]">
            <span>Overall progress</span>
            <span>{loaded ? `${overallProgress}%` : "Syncing..."}</span>
          </div>
          <ProgressBar value={loaded ? overallProgress : 0} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="surface rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                  Next step
                </p>
                <h2 className="mt-2 text-2xl font-bold">Continue where you left off</h2>
              </div>
              <Link
                href="/learn"
                className="text-sm font-semibold text-[var(--accent-strong)]"
              >
                View curriculum
              </Link>
            </div>

            {currentModule && nextLesson ? (
              <div className="mt-6 rounded-3xl border border-black/8 bg-white/75 p-5">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  <span>Current module</span>
                  <span>{currentModule.title}</span>
                </div>
                <h3 className="mt-4 text-2xl font-bold">{nextLesson.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                  {nextLesson.summary}
                </p>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                    <span>Module progress</span>
                    <span>{loaded ? `${currentModuleProgress}%` : "Syncing..."}</span>
                  </div>
                  <ProgressBar value={loaded ? currentModuleProgress : 0} />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/learn/${nextLesson.slug}`}
                    className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
                  >
                    Open next lesson
                  </Link>
                  <Link
                    href={`/learn/module/${currentModule.slug}`}
                    className="inline-flex items-center justify-center rounded-xl border border-black/10 px-5 py-3 text-sm font-semibold text-black transition hover:bg-black/5"
                  >
                    Review module
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-black/8 bg-white/75 p-5">
                <p className="text-sm leading-7 text-[var(--muted)]">
                  Your curriculum summary will update once lessons are available.
                </p>
              </div>
            )}
          </div>

          <div className="surface rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                  Account and access
                </p>
                <h2 className="mt-2 text-2xl font-bold">Manage your learning setup</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-black/8 bg-white/75 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Profile
                </p>
                <p className="mt-3 text-lg font-semibold">{profileLabel}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  Update your display name, timezone, avatar, and bio.
                </p>
                <Link
                  href="/profiles"
                  className="mt-5 inline-flex text-sm font-semibold text-[var(--accent-strong)]"
                >
                  Open profile
                </Link>
              </div>
              <div className="rounded-3xl border border-black/8 bg-white/75 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Subscription
                </p>
                <p className="mt-3 text-lg font-semibold">Free access</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  Upgrade later when paid plans and purchase history are live.
                </p>
                <Link
                  href="/purchases"
                  className="mt-5 inline-flex text-sm font-semibold text-[var(--accent-strong)]"
                >
                  View purchases
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <QuizCard />
          <ChatWindow />
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  helper,
  label,
  value,
}: {
  helper: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-black/8 bg-white/75 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{helper}</p>
    </div>
  );
}
