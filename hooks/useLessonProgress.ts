"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { EMPTY_LESSON_PROGRESS, sanitizeLessonProgress } from "@/lib/progress";
import type { LessonProgress } from "@/types/progress";

const STORAGE_KEY = "satoshilearn.lesson-progress";
const STORAGE_EVENT = "satoshilearn-progress-change";

type ProgressStore = LessonProgress & {
  loaded: boolean;
};

const EMPTY_PROGRESS: ProgressStore = {
  ...EMPTY_LESSON_PROGRESS,
  loaded: false,
};

let cachedRawProgress = "";
let cachedProgress: ProgressStore = EMPTY_PROGRESS;
let hasLoadedRemoteProgress = false;

function notifyProgressChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function writeProgress(progress: LessonProgress, loaded = true) {
  const nextProgress: ProgressStore = {
    ...progress,
    loaded,
  };
  const raw = JSON.stringify(progress);

  cachedRawProgress = raw;
  cachedProgress = nextProgress;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, raw);
    notifyProgressChange();
  }
}

function readLocalProgress(): ProgressStore {
  if (typeof window === "undefined") {
    return EMPTY_PROGRESS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return cachedProgress;
    }

    if (raw === cachedRawProgress) {
      return cachedProgress;
    }

    const normalized = sanitizeLessonProgress(JSON.parse(raw));

    cachedRawProgress = raw;
    cachedProgress = {
      ...normalized,
      loaded: cachedProgress.loaded,
    };

    return cachedProgress;
  } catch {
    return cachedProgress;
  }
}

function loadProgressSnapshot(): ProgressStore {
  const local = readLocalProgress();

  if (local.completedLessonSlugs.length > 0 || local.loaded) {
    return local;
  }

  return cachedProgress;
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => callback();

  window.addEventListener("storage", handleChange);
  window.addEventListener(STORAGE_EVENT, handleChange);

  if (!hasLoadedRemoteProgress) {
    hasLoadedRemoteProgress = true;

    // Keep the external-store snapshot stable unless the progress payload changed.
    void fetch("/api/progress", { method: "GET", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load progress");
        }

        const payload = sanitizeLessonProgress(await response.json());
        const local = readLocalProgress();
        const merged = {
          completedLessonSlugs: Array.from(
            new Set([...local.completedLessonSlugs, ...payload.completedLessonSlugs]),
          ),
        };

        writeProgress(merged, true);
      })
      .catch(() => {
        cachedProgress = {
          ...readLocalProgress(),
          loaded: true,
        };
        notifyProgressChange();
      });
  }

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(STORAGE_EVENT, handleChange);
  };
}

function persistProgress(progress: LessonProgress) {
  void fetch("/api/progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(progress),
  }).catch(() => undefined);
}

export function useLessonProgress() {
  const progress = useSyncExternalStore(
    subscribe,
    loadProgressSnapshot,
    () => EMPTY_PROGRESS,
  );

  const markLessonCompleted = useCallback((slug: string) => {
    const current = loadProgressSnapshot();

    if (current.completedLessonSlugs.includes(slug)) {
      return;
    }

    const next = {
      completedLessonSlugs: [...current.completedLessonSlugs, slug],
    };

    writeProgress(next);
    persistProgress(next);
  }, []);

  const isLessonCompleted = useCallback(
    (slug: string) => progress.completedLessonSlugs.includes(slug),
    [progress.completedLessonSlugs],
  );

  const completedCount = useMemo(
    () => progress.completedLessonSlugs.length,
    [progress.completedLessonSlugs],
  );

  return {
    loaded: progress.loaded,
    completedLessonSlugs: progress.completedLessonSlugs,
    completedCount,
    isLessonCompleted,
    markLessonCompleted,
  };
}
