"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { EMPTY_LESSON_PROGRESS, sanitizeLessonProgress } from "@/lib/progress";
import type { LessonProgress } from "@/types/progress";

const LEGACY_STORAGE_KEY = "satoshilearn.lesson-progress";
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
let currentViewerId = "anonymous";
let inFlightLoad: Promise<void> | null = null;

function getStorageKey(viewerId = currentViewerId) {
  return `satoshilearn.lesson-progress:${viewerId}`;
}

function notifyProgressChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function setViewer(viewerId: string) {
  if (viewerId === currentViewerId) {
    return;
  }

  currentViewerId = viewerId;
  cachedRawProgress = "";
  cachedProgress = EMPTY_PROGRESS;
}

function readStoredProgress(storageKey: string): ProgressStore {
  if (typeof window === "undefined") {
    return EMPTY_PROGRESS;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);

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

function readLocalProgress(): ProgressStore {
  return readStoredProgress(getStorageKey());
}

function writeProgress(progress: LessonProgress, loaded = true, viewerId = currentViewerId) {
  const nextProgress: ProgressStore = {
    ...progress,
    loaded,
  };
  const raw = JSON.stringify(progress);

  currentViewerId = viewerId;
  cachedRawProgress = raw;
  cachedProgress = nextProgress;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(getStorageKey(viewerId), raw);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    notifyProgressChange();
  }
}

function loadProgressSnapshot(): ProgressStore {
  const local = readLocalProgress();

  if (local.completedLessonSlugs.length > 0 || local.loaded) {
    return local;
  }

  return cachedProgress;
}

function sameProgress(left: LessonProgress, right: LessonProgress) {
  if (left.completedLessonSlugs.length !== right.completedLessonSlugs.length) {
    return false;
  }

  return left.completedLessonSlugs.every(
    (slug, index) => slug === right.completedLessonSlugs[index],
  );
}

async function persistProgress(progress: LessonProgress) {
  const response = await fetch("/api/progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(progress),
  });

  if (!response.ok) {
    throw new Error("Failed to save progress");
  }

  const viewerId = response.headers.get("x-progress-viewer-id") ?? "anonymous";
  const payload = sanitizeLessonProgress(await response.json());
  writeProgress(payload, true, viewerId);
}

async function loadRemoteProgress() {
  const response = await fetch("/api/progress", { method: "GET", cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to load progress");
  }

  const viewerId = response.headers.get("x-progress-viewer-id") ?? "anonymous";
  setViewer(viewerId);
  const payload = sanitizeLessonProgress(await response.json());
  const local = readStoredProgress(getStorageKey(viewerId));
  const merged = sanitizeLessonProgress({
    completedLessonSlugs: [
      ...payload.completedLessonSlugs,
      ...local.completedLessonSlugs,
    ],
  });

  writeProgress(merged, true, viewerId);

  if (viewerId !== "anonymous" && !sameProgress(merged, payload)) {
    try {
      await persistProgress(merged);
    } catch {
      // Keep the merged local cache even if the retry fails; the next load can retry.
    }
  }
}

function ensureRemoteProgressLoaded() {
  if (!inFlightLoad) {
    inFlightLoad = loadRemoteProgress()
      .catch(() => {
        cachedProgress = {
          ...readLocalProgress(),
          loaded: true,
        };
        notifyProgressChange();
      })
      .finally(() => {
        inFlightLoad = null;
      });
  }

  return inFlightLoad;
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => callback();

  window.addEventListener("storage", handleChange);
  window.addEventListener(STORAGE_EVENT, handleChange);
  void ensureRemoteProgressLoaded();

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(STORAGE_EVENT, handleChange);
  };
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
    void persistProgress(next).catch(() => undefined);
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
