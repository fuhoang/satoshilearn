import { readFileSync } from "node:fs";
import path from "node:path";

import { lessonConfig, moduleConfig } from "@/content/config";
import type { Lesson, ModuleMeta } from "@/types/lesson";

const lessonsDir = path.join(process.cwd(), "content", "lessons");

function stripFrontmatter(source: string) {
  return source.replace(/^---[\s\S]*?---\n*/, "").trim();
}

export function getLessons() {
  return [...lessonConfig].sort((a, b) => a.order - b.order);
}

export function getModules() {
  return [...moduleConfig].sort((a, b) => a.order - b.order);
}

export function getLessonBySlug(slug: string): Lesson | null {
  const meta = lessonConfig.find((lesson) => lesson.slug === slug);

  if (!meta) {
    return null;
  }

  try {
    const source = readFileSync(path.join(lessonsDir, `${slug}.mdx`), "utf8");

    return {
      ...meta,
      body: stripFrontmatter(source),
    };
  } catch {
    return null;
  }
}

export function getModuleBySlug(slug: string): ModuleMeta | null {
  return moduleConfig.find((module) => module.slug === slug) ?? null;
}

export function getAdjacentLessons(slug: string) {
  const lessons = getLessons();
  const index = lessons.findIndex((lesson) => lesson.slug === slug);

  return {
    previous: index > 0 ? lessons[index - 1] : null,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null,
  };
}
