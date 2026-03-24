import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { EMPTY_LESSON_PROGRESS, sanitizeLessonProgress } from "@/lib/progress";

const PROGRESS_COOKIE = "satoshilearn-progress";

async function readProgress() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PROGRESS_COOKIE)?.value;

  if (!raw) {
    return EMPTY_LESSON_PROGRESS;
  }

  try {
    return sanitizeLessonProgress(JSON.parse(raw));
  } catch {
    return EMPTY_LESSON_PROGRESS;
  }
}

export async function GET() {
  const progress = await readProgress();

  return NextResponse.json(progress);
}

export async function POST(request: Request) {
  const body = (await request.json()) as
    | { slug?: string; complete?: boolean }
    | { completedLessonSlugs?: string[] };

  const current = await readProgress();
  const hasCompletedLessonSlugs =
    "completedLessonSlugs" in body &&
    Array.isArray(body.completedLessonSlugs);

  const next =
    hasCompletedLessonSlugs
      ? sanitizeLessonProgress(body)
      : "slug" in body && body.slug && body.complete
        ? {
            completedLessonSlugs: Array.from(
              new Set([...current.completedLessonSlugs, body.slug]),
            ),
          }
        : current;

  const response = NextResponse.json({
    saved: true,
    ...next,
    updatedAt: new Date().toISOString(),
  });

  response.cookies.set(PROGRESS_COOKIE, JSON.stringify(next), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
