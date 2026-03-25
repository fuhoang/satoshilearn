import type {
  LearningHistory,
  LessonCompletionRecord,
  QuizAttemptRecord,
} from "@/types/activity";

export const EMPTY_LEARNING_HISTORY: LearningHistory = {
  lessonCompletions: [],
  quizAttempts: [],
};

const MAX_LESSON_COMPLETIONS = 12;
const MAX_QUIZ_ATTEMPTS = 12;

function isIsoDate(value: string) {
  return !Number.isNaN(Date.parse(value));
}

export function sanitizeLearningHistory(value: unknown): LearningHistory {
  if (!value || typeof value !== "object") {
    return EMPTY_LEARNING_HISTORY;
  }

  const lessonCompletions = Array.isArray(
    (value as LearningHistory).lessonCompletions,
  )
    ? (value as LearningHistory).lessonCompletions.filter(
        (record): record is LessonCompletionRecord =>
          Boolean(record) &&
          typeof record.lessonSlug === "string" &&
          record.lessonSlug.length > 0 &&
          typeof record.lessonTitle === "string" &&
          record.lessonTitle.length > 0 &&
          typeof record.completedAt === "string" &&
          isIsoDate(record.completedAt),
      )
    : [];

  const dedupedLessonCompletions = Array.from(
    new Map(
      lessonCompletions
        .sort(
          (left, right) =>
            Date.parse(right.completedAt) - Date.parse(left.completedAt),
        )
        .map((record) => [record.lessonSlug, record]),
    ).values(),
  ).slice(0, MAX_LESSON_COMPLETIONS);

  const quizAttempts = Array.isArray((value as LearningHistory).quizAttempts)
    ? (value as LearningHistory).quizAttempts.filter(
        (record): record is QuizAttemptRecord =>
          Boolean(record) &&
          typeof record.lessonSlug === "string" &&
          record.lessonSlug.length > 0 &&
          typeof record.lessonTitle === "string" &&
          record.lessonTitle.length > 0 &&
          typeof record.correctCount === "number" &&
          typeof record.totalQuestions === "number" &&
          typeof record.passed === "boolean" &&
          typeof record.attemptedAt === "string" &&
          isIsoDate(record.attemptedAt),
      )
    : [];

  return {
    lessonCompletions: dedupedLessonCompletions,
    quizAttempts: quizAttempts
      .sort(
        (left, right) =>
          Date.parse(right.attemptedAt) - Date.parse(left.attemptedAt),
      )
      .slice(0, MAX_QUIZ_ATTEMPTS),
  };
}
