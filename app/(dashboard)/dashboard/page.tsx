import Link from "next/link";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { ProgressBar } from "@/components/lesson/ProgressBar";
import { QuizCard } from "@/components/quiz/QuizCard";
import { lessonConfig } from "@/content/config";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="surface rounded-[2rem] p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
          Dashboard
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Your Bitcoin learning cockpit</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">
          Review the curriculum, continue your next lesson, and use the tutor when a concept needs a second pass.
        </p>
        <div className="mt-8">
          <ProgressBar value={40} />
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="surface rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Course roadmap</h2>
            <Link href="/learn" className="text-sm font-semibold text-[var(--accent-strong)]">
              View all lessons
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {lessonConfig.map((lesson) => (
              <Link
                key={lesson.slug}
                href={`/learn/${lesson.slug}`}
                className="block rounded-2xl border border-black/8 bg-white/75 px-4 py-4 transition-colors hover:bg-amber-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{lesson.title}</p>
                    <p className="text-sm text-[var(--muted)]">{lesson.summary}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    {lesson.duration}
                  </span>
                </div>
              </Link>
            ))}
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
