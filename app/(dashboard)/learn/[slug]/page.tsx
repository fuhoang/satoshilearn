import { notFound } from "next/navigation";

import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { LessonNavigation } from "@/components/lesson/LessonNavigation";
import { ProgressBar } from "@/components/lesson/ProgressBar";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizResult } from "@/components/quiz/QuizResult";
import { lessonConfig } from "@/content/config";
import { getAdjacentLessons, getLessonBySlug } from "@/lib/lessons";

export default async function LearnLessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  const adjacent = getAdjacentLessons(slug);
  const progress = Math.round((lesson.order / lessonConfig.length) * 100);
  const keyPoints = lesson.body
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="space-y-8 bg-zinc-950 px-6 py-10 text-white">
      <LessonHeader lesson={lesson} />
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <ProgressBar value={progress} />
      </div>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <LessonContent lesson={lesson} />
        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              In this lesson
            </p>
            <div className="mt-5 space-y-3">
              {keyPoints.map((point, index) => (
                <div
                  key={`${lesson.slug}-point-${index + 1}`}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                    Key idea 0{index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-zinc-300">{point}</p>
                </div>
              ))}
            </div>
          </div>
          <QuizCard />
          <QuizResult />
        </aside>
      </div>
      <LessonNavigation previous={adjacent.previous} next={adjacent.next} />
    </div>
  );
}
