"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  EMPTY_LEARNING_HISTORY,
  mergeLearningHistory,
  sanitizeLearningHistory,
} from "@/lib/learning-history";
import type {
  ConversionEventRecord,
  LearningHistory,
  LessonCompletionRecord,
  QuizAttemptRecord,
} from "@/types/activity";

const STORAGE_KEY = "satoshilearn.learning-history";
const STORAGE_EVENT = "satoshilearn-learning-history-change";

let cachedRawHistory = "";
let cachedHistory = EMPTY_LEARNING_HISTORY;
let hasLoadedRemoteHistory = false;

function notifyHistoryChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function writeHistory(history: LearningHistory) {
  const normalized = sanitizeLearningHistory(history);
  const raw = JSON.stringify(normalized);

  cachedRawHistory = raw;
  cachedHistory = normalized;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, raw);
    notifyHistoryChange();
  }
}

function persistActivity(activity: {
  correctCount?: number;
  eventType?: ConversionEventRecord["eventType"];
  lessonSlug: string;
  lessonTitle: string;
  occurredAt?: string;
  passed?: boolean;
  plan?: ConversionEventRecord["plan"];
  repliedAt?: string;
  source?: string;
  targetSlug?: string;
  targetTitle?: string;
  totalQuestions?: number;
  responsePreview?: string | null;
  topic?: string | null;
  type:
    | "lesson_completion"
    | "quiz_attempt"
    | "tutor_prompt"
    | "conversion_event";
}) {
  void fetch("/api/activity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(activity),
  }).catch(() => undefined);
}

function readHistorySnapshot() {
  if (typeof window === "undefined") {
    return cachedHistory;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return cachedHistory;
    }

    if (raw === cachedRawHistory) {
      return cachedHistory;
    }

    cachedRawHistory = raw;
    cachedHistory = sanitizeLearningHistory(JSON.parse(raw));

    return cachedHistory;
  } catch {
    return cachedHistory;
  }
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => callback();

  window.addEventListener("storage", handleChange);
  window.addEventListener(STORAGE_EVENT, handleChange);

  if (!hasLoadedRemoteHistory) {
    hasLoadedRemoteHistory = true;

    void fetch("/api/activity", { method: "GET", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load activity");
        }

        const payload = sanitizeLearningHistory(await response.json());
        const local = readHistorySnapshot();
        writeHistory(mergeLearningHistory(local, payload));
      })
      .catch(() => undefined);
  }

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(STORAGE_EVENT, handleChange);
  };
}

export function useLearningHistory() {
  const history = useSyncExternalStore(
    subscribe,
    readHistorySnapshot,
    () => EMPTY_LEARNING_HISTORY,
  );

  const recordLessonCompleted = useCallback(
    (record: Omit<LessonCompletionRecord, "completedAt">) => {
      const current = readHistorySnapshot();

      if (
        current.lessonCompletions.some(
          (entry) => entry.lessonSlug === record.lessonSlug,
        )
      ) {
        return;
      }

      writeHistory({
        ...mergeLearningHistory(current, {
          conversionEvents: [],
          lessonCompletions: [
            {
              ...record,
              completedAt: new Date().toISOString(),
            },
          ],
          quizAttempts: [],
          tutorPrompts: [],
        }),
      });
      persistActivity({
        lessonSlug: record.lessonSlug,
        lessonTitle: record.lessonTitle,
        type: "lesson_completion",
      });
    },
    [],
  );

  const recordQuizAttempt = useCallback(
    (record: Omit<QuizAttemptRecord, "attemptedAt">) => {
      const current = readHistorySnapshot();

      writeHistory(
        mergeLearningHistory(current, {
          conversionEvents: [],
          lessonCompletions: [],
          quizAttempts: [
            {
              ...record,
              attemptedAt: new Date().toISOString(),
            },
          ],
          tutorPrompts: [],
        }),
      );
      persistActivity({
        correctCount: record.correctCount,
        lessonSlug: record.lessonSlug,
        lessonTitle: record.lessonTitle,
        passed: record.passed,
        totalQuestions: record.totalQuestions,
        type: "quiz_attempt",
      });
    },
    [],
  );

  const recordTutorPrompt = useCallback((
    prompt: string,
    metadata?: {
      repliedAt?: string;
      responsePreview?: string | null;
      topic?: string | null;
    },
  ) => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      return;
    }

    const current = readHistorySnapshot();

    const repliedAt = metadata?.repliedAt ?? new Date().toISOString();

    writeHistory(
      mergeLearningHistory(current, {
        conversionEvents: [],
        lessonCompletions: [],
        quizAttempts: [],
        tutorPrompts: [
          {
            prompt: trimmedPrompt,
            repliedAt,
            responsePreview: metadata?.responsePreview ?? null,
            topic: metadata?.topic ?? null,
          },
        ],
      }),
    );
    persistActivity({
      lessonSlug: "ai-tutor",
      lessonTitle: trimmedPrompt,
      repliedAt,
      responsePreview: metadata?.responsePreview ?? null,
      topic: metadata?.topic ?? null,
      type: "tutor_prompt",
    });
  }, []);

  const recordConversionEvent = useCallback((record: {
    eventType: ConversionEventRecord["eventType"];
    plan?: ConversionEventRecord["plan"];
    source: string;
    targetSlug: string;
    targetTitle: string;
  }) => {
    const current = readHistorySnapshot();
    const occurredAt = new Date().toISOString();

    writeHistory(
      mergeLearningHistory(current, {
        conversionEvents: [
          {
            eventType: record.eventType,
            occurredAt,
            plan: record.plan ?? null,
            source: record.source,
            targetSlug: record.targetSlug,
            targetTitle: record.targetTitle,
          },
        ],
        lessonCompletions: [],
        quizAttempts: [],
        tutorPrompts: [],
      }),
    );

    persistActivity({
      eventType: record.eventType,
      lessonSlug: record.targetSlug,
      lessonTitle: record.targetTitle,
      occurredAt,
      plan: record.plan ?? null,
      source: record.source,
      targetSlug: record.targetSlug,
      targetTitle: record.targetTitle,
      type: "conversion_event",
    });
  }, []);

  return {
    conversionEvents: history.conversionEvents,
    lessonCompletions: history.lessonCompletions,
    quizAttempts: history.quizAttempts,
    tutorPrompts: history.tutorPrompts,
    recordConversionEvent,
    recordLessonCompleted,
    recordQuizAttempt,
    recordTutorPrompt,
  };
}
