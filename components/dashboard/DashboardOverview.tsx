"use client";

import Link from "next/link";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { ProgressBar } from "@/components/lesson/ProgressBar";
import { QuizCard } from "@/components/quiz/QuizCard";
import type { AccountStatus } from "@/lib/account-status";
import { useLearningHistory } from "@/hooks/useLearningHistory";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { getLearningAnalytics } from "@/lib/learning-history";
import {
  getCompletedModuleLessonCount,
  getCurrentModule,
  getModuleCompletionPercentage,
  getNextModuleLesson,
} from "@/lib/module-progress";
import type { ModuleMeta, TrackMeta } from "@/types/lesson";

type DashboardOverviewProps = {
  accountStatus: AccountStatus;
  currentTrack: TrackMeta;
  modules: ModuleMeta[];
  profileLabel: string;
  totalLessons: number;
};

export function DashboardOverview({
  accountStatus,
  currentTrack,
  modules,
  profileLabel,
  totalLessons,
}: DashboardOverviewProps) {
  const { completedCount, completedLessonSlugs, loaded } = useLessonProgress();
  const { lessonCompletions, quizAttempts, tutorPrompts } = useLearningHistory();
  const learningAnalytics = getLearningAnalytics({
    lessonCompletions,
    quizAttempts,
    tutorPrompts,
  });
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
  const recentActivity = [
    ...lessonCompletions.map((entry) => ({
      kind: "completion" as const,
      lessonSlug: entry.lessonSlug,
      lessonTitle: entry.lessonTitle,
      timestamp: entry.completedAt,
    })),
    ...quizAttempts.map((entry) => ({
      kind: "quiz" as const,
      lessonSlug: entry.lessonSlug,
      lessonTitle: entry.lessonTitle,
      timestamp: entry.attemptedAt,
      passed: entry.passed,
      scoreLabel: `${entry.correctCount}/${entry.totalQuestions}`,
    })),
    ...tutorPrompts.map((entry) => ({
      kind: "tutor" as const,
      lessonSlug: "ai-tutor",
      lessonTitle: entry.prompt,
      timestamp: entry.repliedAt,
    })),
  ]
    .sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp))
    .slice(0, 5);
  const recentQuizAttempts = [...quizAttempts]
    .sort((left, right) => Date.parse(right.attemptedAt) - Date.parse(left.attemptedAt))
    .slice(0, 4);

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
        <div className="mt-5 flex flex-wrap gap-2">
          <StatusPill label={accountStatus.planLabel} tone="accent" />
          <StatusPill label={accountStatus.billingStatus} tone="neutral" />
          <StatusPill label="Tutor history synced" tone="success" />
        </div>
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
            helper={`${accountStatus.headline} · ${accountStatus.billingStatus}`}
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Learning streak"
            value={`${learningAnalytics.streakDays} day${learningAnalytics.streakDays === 1 ? "" : "s"}`}
            helper="Consecutive days with tracked learning activity"
          />
          <SummaryCard
            label="Tutor sessions"
            value={String(learningAnalytics.totalTutorPrompts)}
            helper="Saved AI tutor prompts in your history"
          />
          <SummaryCard
            label="Checks passed"
            value={`${learningAnalytics.passedQuizCount} / ${learningAnalytics.totalQuizAttempts}`}
            helper="Passed quiz attempts across your dashboard history"
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
            <div className="mt-6 grid gap-4 md:grid-cols-3">
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
                <p className="mt-3 text-lg font-semibold">{accountStatus.headline}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  {accountStatus.planSummary}
                </p>
                <div className="mt-4 space-y-2">
                  {accountStatus.upcomingFeatures.slice(0, 2).map((feature) => (
                    <p
                      key={feature}
                      className="rounded-2xl border border-black/8 bg-black/5 px-3 py-2 text-sm text-[var(--muted)]"
                    >
                      {feature}
                    </p>
                  ))}
                </div>
                <Link
                  href={accountStatus.ctaHref}
                  className="mt-5 inline-flex text-sm font-semibold text-[var(--accent-strong)]"
                >
                  {accountStatus.ctaLabel}
                </Link>
              </div>
              <div className="rounded-3xl border border-black/8 bg-white/75 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Learning setup
                </p>
                <p className="mt-3 text-lg font-semibold">Protected account</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  Progress sync, reset-password support, authenticated access, and dashboard history are active on this account.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <StatusPill label="Auth active" tone="neutral" />
                  <StatusPill label={`${currentTrack.title} track`} tone="accent" />
                  <StatusPill label="Progress sync" tone="success" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="surface rounded-3xl p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                Recent activity
              </p>
              <h2 className="mt-2 text-2xl font-bold">Your latest learning moments</h2>
              {recentActivity.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {recentActivity.map((entry) => (
                    <div
                      key={`${entry.kind}-${entry.lessonSlug}-${entry.timestamp}`}
                      className="rounded-3xl border border-black/8 bg-white/75 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">
                            {entry.kind === "completion"
                              ? "Lesson completed"
                              : entry.kind === "tutor"
                                ? "Tutor session"
                                : entry.passed
                                  ? "Quiz passed"
                                  : "Quiz review needed"}
                          </p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {entry.lessonTitle}
                            {entry.kind === "quiz" ? ` · ${entry.scoreLabel}` : ""}
                          </p>
                        </div>
                        <span className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                          {formatRelativeTimestamp(entry.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  body="Complete a lesson or check a quiz to start building your activity feed."
                  title="No activity yet"
                />
              )}
            </div>

            <div className="surface rounded-3xl p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                Quiz history
              </p>
              <h2 className="mt-2 text-2xl font-bold">How your checks are going</h2>
              {recentQuizAttempts.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {recentQuizAttempts.map((attempt) => (
                    <div
                      key={`${attempt.lessonSlug}-${attempt.attemptedAt}`}
                      className="rounded-3xl border border-black/8 bg-white/75 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{attempt.lessonTitle}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {attempt.correctCount} of {attempt.totalQuestions} correct
                          </p>
                        </div>
                        <StatusPill
                          label={attempt.passed ? "Passed" : "Retry"}
                          tone={attempt.passed ? "success" : "warning"}
                        />
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                        {formatRelativeTimestamp(attempt.attemptedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  body="Your last quiz results will appear here once you finish a lesson check."
                  title="No quiz attempts yet"
                />
              )}
            </div>

            <div className="surface rounded-3xl p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                Tutor history
              </p>
              <h2 className="mt-2 text-2xl font-bold">Recent AI tutor prompts</h2>
              {tutorPrompts.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {tutorPrompts.slice(0, 4).map((entry) => (
                    <div
                      key={`${entry.prompt}-${entry.repliedAt}`}
                      className="rounded-3xl border border-black/8 bg-white/75 p-4"
                    >
                      {entry.topic ? (
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                          {entry.topic}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm font-semibold">{entry.prompt}</p>
                      {entry.responsePreview ? (
                        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                          {entry.responsePreview}
                        </p>
                      ) : null}
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                        {formatRelativeTimestamp(entry.repliedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  body="Ask the AI tutor a question and it will show up here for quick reference."
                  title="No tutor prompts yet"
                />
              )}
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

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "accent" | "neutral" | "success" | "warning";
}) {
  const classes = {
    accent: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    neutral: "border-black/10 bg-black/5 text-[var(--muted)]",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${classes[tone]}`}
    >
      {label}
    </span>
  );
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="mt-6 rounded-3xl border border-black/8 bg-white/75 p-5">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{body}</p>
    </div>
  );
}

function formatRelativeTimestamp(timestamp: string) {
  const diffMs = Date.now() - Date.parse(timestamp);
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
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
