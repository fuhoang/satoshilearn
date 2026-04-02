import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { EMPTY_LESSON_PROGRESS, sanitizeLessonProgress } from "@/lib/progress";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const PROGRESS_COOKIE = "satoshilearn-progress";

async function getAuthenticatedProgressContext() {
  const supabase = await createServerSupabaseClient();
  const admin = createSupabaseAdminClient();

  if (!supabase || !admin) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    admin,
    user,
  };
}

async function readCookieProgress() {
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

async function writeCookieProgress(progress: typeof EMPTY_LESSON_PROGRESS) {
  const response = NextResponse.json({
    saved: true,
    ...progress,
    updatedAt: new Date().toISOString(),
  });
  response.headers.set("x-progress-viewer-id", "anonymous");

  response.cookies.set(PROGRESS_COOKIE, JSON.stringify(progress), {
    // The fallback cookie is API-owned state, not client-owned application state.
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

async function readSupabaseProgress() {
  const context = await getAuthenticatedProgressContext();

  if (!context) {
    return null;
  }
  const { admin, user } = context;

  if (!user) {
    return {
      progress: EMPTY_LESSON_PROGRESS,
      persisted: false,
      userId: null,
    };
  }

  const { data, error } = await admin
    .from("lesson_progress")
    .select("lesson_slug")
    .eq("user_id", user.id);

  if (error) {
    return null;
  }

  return {
    progress: sanitizeLessonProgress({
      completedLessonSlugs: data.map((row) => row.lesson_slug),
    }),
    persisted: true,
    userId: user.id,
  };
}

async function writeSupabaseProgress(progress: typeof EMPTY_LESSON_PROGRESS) {
  const context = await getAuthenticatedProgressContext();

  if (!context) {
    return null;
  }
  const { admin, user } = context;

  if (!user) {
    return {
      response: NextResponse.json(
        { error: "You must be logged in to save progress." },
        { status: 401 },
      ),
      saved: false,
      userId: null,
    };
  }

  const nextSlugs = progress.completedLessonSlugs;
  const { data: existingRows, error: existingError } = await admin
    .from("lesson_progress")
    .select("lesson_slug")
    .eq("user_id", user.id);

  if (existingError) {
    return null;
  }

  const staleSlugs = existingRows
    .map((row) => row.lesson_slug)
    .filter((slug) => !nextSlugs.includes(slug));

  const deleteQuery = staleSlugs.length
    ? admin
        .from("lesson_progress")
        .delete()
        .eq("user_id", user.id)
        .in("lesson_slug", staleSlugs)
    : null;
  const { error: deleteError } = deleteQuery
    ? await deleteQuery
    : { error: null };

  if (deleteError) {
    return null;
  }

  if (nextSlugs.length > 0) {
    const { error: upsertError } = await admin.from("lesson_progress").upsert(
      nextSlugs.map((slug) => ({
        lesson_slug: slug,
        user_id: user.id,
      })),
      {
        onConflict: "user_id,lesson_slug",
      },
    );

    if (upsertError) {
      return null;
    }
  }

  return {
    response: (() => {
      const response = NextResponse.json({
        saved: true,
        ...progress,
        updatedAt: new Date().toISOString(),
      });
      response.headers.set("x-progress-viewer-id", user.id);
      return response;
    })(),
    saved: true,
    user,
    userId: user.id,
  };
}

async function readWritableBaseProgress() {
  const stored = await readSupabaseProgress();

  if (stored?.persisted) {
    return stored.progress;
  }

  return readCookieProgress();
}

export async function GET() {
  const stored = await readSupabaseProgress();

  if (stored) {
    const response = NextResponse.json(stored.progress);
    response.headers.set("x-progress-viewer-id", stored.userId ?? "anonymous");
    return response;
  }

  const response = NextResponse.json(await readCookieProgress());
  response.headers.set("x-progress-viewer-id", "anonymous");
  return response;
}

export async function POST(request: Request) {
  let body:
    | { slug?: string; complete?: boolean }
    | { completedLessonSlugs?: string[] };

  try {
    body = (await request.json()) as
      | { slug?: string; complete?: boolean }
      | { completedLessonSlugs?: string[] };
  } catch {
    return NextResponse.json(
      { error: "Send a valid progress update body." },
      { status: 400 },
    );
  }

  const current = await readWritableBaseProgress();
  const hasCompletedLessonSlugs =
    "completedLessonSlugs" in body &&
    Array.isArray(body.completedLessonSlugs);

  const next =
    hasCompletedLessonSlugs
      ? sanitizeLessonProgress(body)
      : "slug" in body && body.slug && body.complete
        ? sanitizeLessonProgress({
            completedLessonSlugs: [...current.completedLessonSlugs, body.slug],
          })
        : current;

  const supabaseWrite = await writeSupabaseProgress(next);

  if (supabaseWrite?.saved) {
    return supabaseWrite.response;
  }

  if (supabaseWrite?.response) {
    return supabaseWrite.response;
  }

  const context = await getAuthenticatedProgressContext();
  const user = context?.user ?? null;

  if (user) {
    return NextResponse.json(
      { error: "Unable to save progress right now." },
      { status: 500 },
    );
  }

  return writeCookieProgress(next);
}
