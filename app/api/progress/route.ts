import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const PROGRESS_COOKIE = "satoshilearn-progress";

type ProgressPayload = {
  completedLessonSlugs: string[];
};

function sanitizeProgress(value: unknown): ProgressPayload {
  if (
    !value ||
    typeof value !== "object" ||
    !Array.isArray((value as ProgressPayload).completedLessonSlugs)
  ) {
    return { completedLessonSlugs: [] };
  }

  return {
    completedLessonSlugs: Array.from(
      new Set(
        (value as ProgressPayload).completedLessonSlugs.filter(
          (slug): slug is string => typeof slug === "string" && slug.length > 0,
        ),
      ),
    ),
  };
}

async function readProgress() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PROGRESS_COOKIE)?.value;

  if (!raw) {
    return { completedLessonSlugs: [] };
  }

  try {
    return sanitizeProgress(JSON.parse(raw));
  } catch {
    return { completedLessonSlugs: [] };
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
      ? sanitizeProgress(body)
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
