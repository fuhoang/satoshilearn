import type {
  ConversionEventRecord,
  LearningHistory,
  LessonCompletionRecord,
  QuizAttemptRecord,
  TutorPromptRecord,
} from "@/types/activity";

export const EMPTY_LEARNING_HISTORY: LearningHistory = {
  conversionEvents: [],
  lessonCompletions: [],
  quizAttempts: [],
  tutorPrompts: [],
};

const MAX_LESSON_COMPLETIONS = 12;
const MAX_QUIZ_ATTEMPTS = 12;
const MAX_TUTOR_PROMPTS = 10;
const MAX_CONVERSION_EVENTS = 20;

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

  const tutorPrompts = Array.isArray((value as LearningHistory).tutorPrompts)
    ? (value as LearningHistory).tutorPrompts.filter(
        (record): record is TutorPromptRecord =>
          Boolean(record) &&
          typeof record.prompt === "string" &&
          record.prompt.length > 0 &&
          typeof record.repliedAt === "string" &&
          (record.responsePreview === null ||
            typeof record.responsePreview === "string") &&
          (record.topic === null || typeof record.topic === "string") &&
          isIsoDate(record.repliedAt),
      )
    : [];

  const conversionEvents = Array.isArray(
    (value as LearningHistory).conversionEvents,
  )
    ? (value as LearningHistory).conversionEvents.filter(
        (record): record is ConversionEventRecord =>
          Boolean(record) &&
          typeof record.eventType === "string" &&
          [
            "locked_view",
            "upgrade_click",
            "checkout_start",
            "checkout_complete",
          ].includes(record.eventType) &&
          typeof record.occurredAt === "string" &&
          isIsoDate(record.occurredAt) &&
          (record.plan === null ||
            record.plan === "pro_monthly" ||
            record.plan === "pro_yearly") &&
          typeof record.source === "string" &&
          record.source.length > 0 &&
          typeof record.targetSlug === "string" &&
          record.targetSlug.length > 0 &&
          typeof record.targetTitle === "string" &&
          record.targetTitle.length > 0,
      )
    : [];

  const dedupedTutorPrompts = Array.from(
    new Map(
      tutorPrompts
        .sort(
          (left, right) =>
            Date.parse(right.repliedAt) - Date.parse(left.repliedAt),
        )
        .map((record) => [`${record.prompt}::${record.repliedAt}`, record]),
    ).values(),
  );

  const dedupedConversionEvents = Array.from(
    new Map(
      conversionEvents
        .sort(
          (left, right) =>
            Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
        )
        .map((record) => [
          `${record.eventType}::${record.source}::${record.targetSlug}::${record.occurredAt}`,
          record,
        ]),
    ).values(),
  );

  return {
    conversionEvents: dedupedConversionEvents.slice(0, MAX_CONVERSION_EVENTS),
    lessonCompletions: dedupedLessonCompletions,
    quizAttempts: quizAttempts
      .sort(
        (left, right) =>
          Date.parse(right.attemptedAt) - Date.parse(left.attemptedAt),
      )
      .slice(0, MAX_QUIZ_ATTEMPTS),
    tutorPrompts: dedupedTutorPrompts.slice(0, MAX_TUTOR_PROMPTS),
  };
}

function toUtcDateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function shiftUtcDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getLearningAnalytics(history: LearningHistory) {
  const conversionEvents = history.conversionEvents ?? [];
  const activityDateKeys = Array.from(
    new Set(
      [
        ...history.lessonCompletions.map((entry) => toUtcDateKey(entry.completedAt)),
        ...history.quizAttempts.map((entry) => toUtcDateKey(entry.attemptedAt)),
        ...history.tutorPrompts.map((entry) => toUtcDateKey(entry.repliedAt)),
        ...conversionEvents.map((entry) => toUtcDateKey(entry.occurredAt)),
      ].sort((left, right) => right.localeCompare(left)),
    ),
  );

  const activityDates = new Set(activityDateKeys);
  let streakDays = 0;
  let cursor = new Date().toISOString().slice(0, 10);

  while (activityDates.has(cursor)) {
    streakDays += 1;
    cursor = shiftUtcDateKey(cursor, -1);
  }

  const passedQuizCount = history.quizAttempts.filter((entry) => entry.passed).length;
  const conversionCounts = conversionEvents.reduce(
    (counts, event) => {
      counts[event.eventType] += 1;
      return counts;
    },
    {
      checkout_complete: 0,
      checkout_start: 0,
      locked_view: 0,
      upgrade_click: 0,
    },
  );

  return {
    activeDays: activityDateKeys.length,
    checkoutCompletionCount: conversionCounts.checkout_complete,
    checkoutStartCount: conversionCounts.checkout_start,
    latestTutorPrompt: history.tutorPrompts[0] ?? null,
    lockedViewCount: conversionCounts.locked_view,
    passedQuizCount,
    streakDays,
    totalTutorPrompts: history.tutorPrompts.length,
    totalQuizAttempts: history.quizAttempts.length,
    upgradeClickCount: conversionCounts.upgrade_click,
  };
}

export function mergeLearningHistory(
  current: LearningHistory,
  incoming: LearningHistory,
) {
  return sanitizeLearningHistory({
    conversionEvents: [...incoming.conversionEvents, ...current.conversionEvents],
    lessonCompletions: [
      ...incoming.lessonCompletions,
      ...current.lessonCompletions,
    ],
    quizAttempts: [...incoming.quizAttempts, ...current.quizAttempts],
    tutorPrompts: [...incoming.tutorPrompts, ...current.tutorPrompts],
  });
}
