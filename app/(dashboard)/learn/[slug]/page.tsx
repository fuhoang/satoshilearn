import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProFeatureGate } from "@/components/billing/ProFeatureGate";
import { hasProAccessForCurrentUser } from "@/lib/account-status";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { LessonQuizGate } from "@/components/lesson/LessonQuizGate";
import { LessonWorkspace } from "@/components/lesson/LessonWorkspace";
import { ProgressBar } from "@/components/lesson/ProgressBar";
import { lessonConfig, moduleConfig } from "@/content/config";
import { buildLessonQuiz } from "@/lib/lesson-quiz";
import { getAdjacentLessons, getLessonBySlug } from "@/lib/lessons";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    return createPageMetadata({
      title: "Lesson",
      description: "Blockwise Bitcoin lesson.",
      pathname: `/learn/${slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: lesson.title,
    description: lesson.summary,
    pathname: `/learn/${slug}`,
    noIndex: true,
  });
}

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

  const hasProAccess = await hasProAccessForCurrentUser();

  if (lesson.requiresPro && !hasProAccess) {
    return (
      <ProFeatureGate
        eyebrow="Pro lesson"
        source="locked_lesson_page"
        targetSlug={lesson.slug}
        targetTitle={lesson.title}
        title={`${lesson.title} is part of Pro`}
        description="This lesson sits inside the premium side of the curriculum. Upgrade to continue into advanced lessons and get stronger tutor access."
      />
    );
  }

  const adjacent = getAdjacentLessons(slug);
  const currentModule =
    moduleConfig.find((item) => item.title === lesson.section) ?? null;
  const moduleLessonIndex = currentModule
    ? currentModule.lessons.findIndex((item) => item.slug === lesson.slug)
    : -1;
  const progress = Math.round((lesson.order / lessonConfig.length) * 100);
  const quizQuestions = buildLessonQuiz(lesson);
  const keyPoints = lesson.body
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="space-y-8 bg-zinc-950 px-6 py-10 text-white">
      <LessonHeader
        lesson={lesson}
        module={currentModule}
        moduleLessonIndex={moduleLessonIndex}
      />
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <ProgressBar value={progress} />
      </div>
      <LessonWorkspace keyPoints={keyPoints} lesson={lesson} />
      <LessonQuizGate
        lessonSlug={lesson.slug}
        lessonTitle={lesson.title}
        next={adjacent.next}
        previous={adjacent.previous}
        questions={quizQuestions}
      />
    </div>
  );
}
