"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { EMPTY_LESSON_PROGRESS, sanitizeLessonProgress } from "@/lib/progress";
import type { LessonProgress } from "@/types/progress";

const LEGACY_STORAGE_KEY = "satoshilearn.lesson-progress";
const STORAGE_EVENT = "satoshilearn-progress-change";

type ProgressStore = LessonProgress & {
  loaded: boolean;
  saveError: string | null;
  saveState: "idle" | "saving" | "error";
};

const EMPTY_PROGRESS: ProgressStore = {
  ...EMPTY_LESSON_PROGRESS,
  loaded: false,
  saveError: null,
  saveState: "idle",
};

let cachedRawProgress = "";
let cachedProgress: ProgressStore = EMPTY_PROGRESS;
let currentViewerId = "anonymous";
let inFlightLoad: Promise<void> | null = null;
let pendingProgress: LessonProgress | null = null;

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

function writeProgress(
  progress: LessonProgress,
  options: {
    loaded?: boolean;
    saveError?: string | null;
    saveState?: ProgressStore["saveState"];
    viewerId?: string;
  } = {},
) {
  const {
    loaded = true,
    saveError = cachedProgress.saveError,
    saveState = cachedProgress.saveState,
    viewerId = currentViewerId,
  } = options;
  const nextProgress: ProgressStore = {
    ...progress,
    loaded,
    saveError,
    saveState,
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

function updateSaveState(
  saveState: ProgressStore["saveState"],
  saveError: string | null = null,
) {
  cachedProgress = {
    ...cachedProgress,
    saveError,
    saveState,
  };
  notifyProgressChange();
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
  pendingProgress = null;
  writeProgress(payload, {
    loaded: true,
    saveError: null,
    saveState: "idle",
    viewerId,
  });
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

  writeProgress(merged, {
    loaded: true,
    saveError: null,
    saveState: "idle",
    viewerId,
  });

  if (viewerId !== "anonymous" && !sameProgress(merged, payload)) {
    pendingProgress = merged;
    updateSaveState("saving");

    try {
      await persistProgress(merged);
    } catch {
      updateSaveState("error", "Unable to save progress right now.");
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
          saveError: null,
          saveState: "idle",
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

    pendingProgress = next;
    writeProgress(next, {
      loaded: true,
      saveError: null,
      saveState: "saving",
    });
    void persistProgress(next).catch(() => {
      updateSaveState("error", "Unable to save progress right now.");
    });
  }, []);

  const retryLastSave = useCallback(() => {
    if (!pendingProgress) {
      return;
    }

    updateSaveState("saving");
    void persistProgress(pendingProgress).catch(() => {
      updateSaveState("error", "Unable to save progress right now.");
    });
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
    retryLastSave,
    saveError: progress.saveError,
    saveState: progress.saveState,
  };
}
