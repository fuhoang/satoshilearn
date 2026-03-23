import { notFound } from "next/navigation";

import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { LessonNavigation } from "@/components/lesson/LessonNavigation";
import { ProgressBar } from "@/components/lesson/ProgressBar";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizResult } from "@/components/quiz/QuizResult";
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

  return (
    <div className="space-y-8">
      <LessonHeader lesson={lesson} />
      <ProgressBar value={Math.round((lesson.order / 5) * 100)} />
      <LessonContent lesson={lesson} />
      <div className="grid gap-6 xl:grid-cols-2">
        <QuizCard />
        <QuizResult />
      </div>
      <LessonNavigation previous={adjacent.previous} next={adjacent.next} />
    </div>
  );
}
