import { lessonConfig } from "@/content/config";
import type { LessonProgress } from "@/types/progress";

export const EMPTY_LESSON_PROGRESS: LessonProgress = {
  completedLessonSlugs: [],
};

const KNOWN_LESSON_SLUGS = new Set(lessonConfig.map((lesson) => lesson.slug));

export function sanitizeLessonProgress(value: unknown): LessonProgress {
  if (
    !value ||
    typeof value !== "object" ||
    !Array.isArray((value as LessonProgress).completedLessonSlugs)
  ) {
    return EMPTY_LESSON_PROGRESS;
  }

  return {
    completedLessonSlugs: Array.from(
      new Set(
        (value as LessonProgress).completedLessonSlugs.filter(
          (slug): slug is string =>
            typeof slug === "string" &&
            slug.length > 0 &&
            KNOWN_LESSON_SLUGS.has(slug),
        ),
      ),
    ),
  };
}
