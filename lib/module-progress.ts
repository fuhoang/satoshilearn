import type { ModuleMeta } from "@/types/lesson";

export function getCompletedModuleLessonCount(
  module: ModuleMeta,
  completedLessonSlugs: string[],
) {
  return module.lessons.filter((lesson) => completedLessonSlugs.includes(lesson.slug))
    .length;
}

export function isModuleLessonUnlocked(
  module: ModuleMeta,
  lessonSlug: string,
  completedLessonSlugs: string[],
) {
  const lessonIndex = module.lessons.findIndex((lesson) => lesson.slug === lessonSlug);

  if (lessonIndex <= 0) {
    return lessonIndex === 0;
  }

  return completedLessonSlugs.includes(module.lessons[lessonIndex - 1].slug);
}

export function getNextModuleLesson(
  module: ModuleMeta,
  completedLessonSlugs: string[],
) {
  return (
    module.lessons.find((lesson) =>
      isModuleLessonUnlocked(module, lesson.slug, completedLessonSlugs) &&
      !completedLessonSlugs.includes(lesson.slug),
    ) ?? module.lessons[module.lessons.length - 1]
  );
}

export function getModuleCompletionPercentage(
  module: ModuleMeta,
  completedLessonSlugs: string[],
) {
  if (module.lessons.length === 0) {
    return 0;
  }

  return Math.round(
    (getCompletedModuleLessonCount(module, completedLessonSlugs) /
      module.lessons.length) *
      100,
  );
}

export function getCurrentModule(
  modules: ModuleMeta[],
  completedLessonSlugs: string[],
) {
  return (
    modules.find(
      (module) =>
        getCompletedModuleLessonCount(module, completedLessonSlugs) <
        module.lessons.length,
    ) ?? modules[modules.length - 1] ?? null
  );
}
