import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  EMPTY_LEARNING_HISTORY,
  mergeLearningHistory,
  sanitizeLearningHistory,
} from "@/lib/learning-history";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  ConversionEventRecord,
  LearningHistory,
  QuizAttemptRecord,
  TutorPromptRecord,
} from "@/types/activity";

const ACTIVITY_COOKIE = "satoshilearn-activity";

type ActivityInsertBody =
  | {
      type: "lesson_completion";
      lessonSlug?: string;
      lessonTitle?: string;
      completedAt?: string;
    }
  | {
      type: "quiz_attempt";
      lessonSlug?: string;
      lessonTitle?: string;
      correctCount?: number;
      totalQuestions?: number;
      passed?: boolean;
      attemptedAt?: string;
    }
  | {
      type: "tutor_prompt";
      lessonSlug?: string;
      lessonTitle?: string;
      repliedAt?: string;
      responsePreview?: string;
      topic?: string;
    }
  | {
      type: "conversion_event";
      eventType?: ConversionEventRecord["eventType"];
      occurredAt?: string;
      plan?: ConversionEventRecord["plan"];
      source?: string;
      targetSlug?: string;
      targetTitle?: string;
    };

async function readCookieHistory() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ACTIVITY_COOKIE)?.value;

  if (!raw) {
    return EMPTY_LEARNING_HISTORY;
  }

  try {
    return sanitizeLearningHistory(JSON.parse(raw));
  } catch {
    return EMPTY_LEARNING_HISTORY;
  }
}

async function writeCookieHistory(history: LearningHistory) {
  const normalized = sanitizeLearningHistory(history);
  const response = NextResponse.json(normalized);

  response.cookies.set(ACTIVITY_COOKIE, JSON.stringify(normalized), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

async function readSupabaseHistory() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      history: EMPTY_LEARNING_HISTORY,
      persisted: false,
    };
  }

  const { data, error } = await supabase
    .from("learning_activity")
    .select(
      "activity_type, lesson_slug, lesson_title, correct_count, total_questions, passed, created_at, activity_context, response_preview",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(24);

  if (error) {
    return null;
  }

  return {
    history: sanitizeLearningHistory({
      lessonCompletions: data
        .filter((row) => row.activity_type === "lesson_completion")
        .map((row) => ({
          lessonSlug: row.lesson_slug,
          lessonTitle: row.lesson_title,
          completedAt: row.created_at,
        })),
      quizAttempts: data
        .filter((row) => row.activity_type === "quiz_attempt")
        .map((row) => ({
          lessonSlug: row.lesson_slug,
          lessonTitle: row.lesson_title,
          correctCount: row.correct_count ?? 0,
          totalQuestions: row.total_questions ?? 0,
          passed: Boolean(row.passed),
          attemptedAt: row.created_at,
        })),
      tutorPrompts: data
        .filter((row) => row.activity_type === "tutor_prompt")
        .map((row) => ({
          prompt: row.lesson_title,
          repliedAt: row.created_at,
          responsePreview: row.response_preview ?? null,
          topic: row.activity_context ?? null,
        })),
      conversionEvents: data
        .filter((row) => row.activity_type === "conversion_event")
        .map((row) => {
          let context:
            | {
                eventType?: ConversionEventRecord["eventType"];
                plan?: ConversionEventRecord["plan"];
                source?: string;
              }
            | null = null;

          if (row.activity_context) {
            try {
              context = JSON.parse(row.activity_context) as {
                eventType?: ConversionEventRecord["eventType"];
                plan?: ConversionEventRecord["plan"];
                source?: string;
              };
            } catch {
              context = null;
            }
          }

          return {
            eventType: context?.eventType ?? "upgrade_click",
            occurredAt: row.created_at,
            plan:
              context?.plan === "pro_monthly" || context?.plan === "pro_yearly"
                ? context.plan
                : null,
            source: context?.source ?? "unknown",
            targetSlug: row.lesson_slug,
            targetTitle: row.lesson_title,
          };
        }),
    }),
    persisted: true,
  };
}

function sanitizeActivityInsert(body: ActivityInsertBody) {
  if (!body || typeof body !== "object" || typeof body.type !== "string") {
    return null;
  }

  if (body.type === "lesson_completion") {
    if (
      typeof body.lessonSlug !== "string" ||
      body.lessonSlug.length === 0 ||
      typeof body.lessonTitle !== "string" ||
      body.lessonTitle.length === 0
    ) {
      return null;
    }

    return {
      type: "lesson_completion" as const,
      lessonSlug: body.lessonSlug,
      lessonTitle: body.lessonTitle,
      completedAt:
        typeof body.completedAt === "string" && !Number.isNaN(Date.parse(body.completedAt))
          ? body.completedAt
          : new Date().toISOString(),
    };
  }

  if (body.type === "tutor_prompt") {
    if (
      typeof body.lessonSlug !== "string" ||
      body.lessonSlug.length === 0 ||
      typeof body.lessonTitle !== "string" ||
      body.lessonTitle.length === 0
    ) {
      return null;
    }

    return {
      type: "tutor_prompt" as const,
      lessonSlug: body.lessonSlug,
      lessonTitle: body.lessonTitle,
      repliedAt:
        typeof body.repliedAt === "string" &&
        !Number.isNaN(Date.parse(body.repliedAt))
          ? body.repliedAt
          : new Date().toISOString(),
      responsePreview:
        typeof body.responsePreview === "string" && body.responsePreview.length > 0
          ? body.responsePreview
          : null,
      topic:
        typeof body.topic === "string" && body.topic.length > 0 ? body.topic : null,
    };
  }

  if (
    body.type === "conversion_event" &&
    (body.eventType === "locked_view" ||
      body.eventType === "upgrade_click" ||
      body.eventType === "checkout_start" ||
      body.eventType === "checkout_complete") &&
    typeof body.source === "string" &&
    body.source.length > 0 &&
    typeof body.targetSlug === "string" &&
    body.targetSlug.length > 0 &&
    typeof body.targetTitle === "string" &&
    body.targetTitle.length > 0
  ) {
    return {
      type: "conversion_event" as const,
      eventType: body.eventType,
      occurredAt:
        typeof body.occurredAt === "string" &&
        !Number.isNaN(Date.parse(body.occurredAt))
          ? body.occurredAt
          : new Date().toISOString(),
      plan:
        body.plan === "pro_monthly" || body.plan === "pro_yearly" ? body.plan : null,
      source: body.source,
      targetSlug: body.targetSlug,
      targetTitle: body.targetTitle,
    };
  }

  if (
    body.type === "quiz_attempt" &&
    typeof body.lessonSlug === "string" &&
    body.lessonSlug.length > 0 &&
    typeof body.lessonTitle === "string" &&
    body.lessonTitle.length > 0 &&
    typeof body.correctCount === "number" &&
    typeof body.totalQuestions === "number" &&
    typeof body.passed === "boolean"
  ) {
    return {
      type: "quiz_attempt" as const,
      lessonSlug: body.lessonSlug,
      lessonTitle: body.lessonTitle,
      correctCount: body.correctCount,
      totalQuestions: body.totalQuestions,
      passed: body.passed,
      attemptedAt:
        typeof body.attemptedAt === "string" && !Number.isNaN(Date.parse(body.attemptedAt))
          ? body.attemptedAt
          : new Date().toISOString(),
    };
  }

  return null;
}

async function writeSupabaseHistory(body: ActivityInsertBody) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      persisted: false,
      response: NextResponse.json(
        { error: "You must be logged in to save activity." },
        { status: 401 },
      ),
    };
  }

  const nextActivity = sanitizeActivityInsert(body);

  if (!nextActivity) {
    return {
      persisted: false,
      response: NextResponse.json({ error: "Invalid activity payload." }, { status: 400 }),
    };
  }

  if (nextActivity.type === "lesson_completion") {
    const { data: existingCompletion, error: existingError } = await supabase
      .from("learning_activity")
      .select("id")
      .eq("user_id", user.id)
      .eq("activity_type", "lesson_completion")
      .eq("lesson_slug", nextActivity.lessonSlug)
      .maybeSingle();

    if (existingError) {
      return null;
    }

    if (existingCompletion) {
      const history = await readSupabaseHistory();
      return history
        ? {
            persisted: true,
            response: NextResponse.json(history.history),
          }
        : null;
    }
  }

  const insertPayload =
    nextActivity.type === "lesson_completion"
      ? {
          activity_type: "lesson_completion",
          created_at: nextActivity.completedAt,
          lesson_slug: nextActivity.lessonSlug,
          lesson_title: nextActivity.lessonTitle,
          user_id: user.id,
        }
      : nextActivity.type === "quiz_attempt"
        ? {
            activity_type: "quiz_attempt",
            correct_count: nextActivity.correctCount,
            created_at: nextActivity.attemptedAt,
            lesson_slug: nextActivity.lessonSlug,
            lesson_title: nextActivity.lessonTitle,
            passed: nextActivity.passed,
            total_questions: nextActivity.totalQuestions,
            user_id: user.id,
          }
        : nextActivity.type === "tutor_prompt"
          ? {
            activity_context: nextActivity.topic,
            activity_type: "tutor_prompt",
            created_at: nextActivity.repliedAt,
            lesson_slug: nextActivity.lessonSlug,
            lesson_title: nextActivity.lessonTitle,
            response_preview: nextActivity.responsePreview,
            user_id: user.id,
          }
          : {
            activity_context: JSON.stringify({
              eventType: nextActivity.eventType,
              plan: nextActivity.plan,
              source: nextActivity.source,
            }),
            activity_type: "conversion_event",
            created_at: nextActivity.occurredAt,
            lesson_slug: nextActivity.targetSlug,
            lesson_title: nextActivity.targetTitle,
            user_id: user.id,
          };

  const { error } = await supabase.from("learning_activity").insert(insertPayload);

  if (error) {
    return null;
  }

  const history = await readSupabaseHistory();

  return history
    ? {
        persisted: true,
        response: NextResponse.json(history.history),
      }
    : null;
}

export async function GET() {
  const supabaseHistory = await readSupabaseHistory();

  if (supabaseHistory) {
    return NextResponse.json(supabaseHistory.history);
  }

  return NextResponse.json(await readCookieHistory());
}

export async function POST(request: Request) {
  const body = (await request.json()) as ActivityInsertBody;
  const supabaseWrite = await writeSupabaseHistory(body);

  if (supabaseWrite?.persisted) {
    return supabaseWrite.response;
  }

  if (supabaseWrite?.response) {
    return supabaseWrite.response;
  }

  const current = await readCookieHistory();
  const nextActivity = sanitizeActivityInsert(body);

  if (!nextActivity) {
    return NextResponse.json({ error: "Invalid activity payload." }, { status: 400 });
  }

  const merged =
    nextActivity.type === "lesson_completion"
      ? mergeLearningHistory(current, {
          conversionEvents: [],
          lessonCompletions: [
            {
              lessonSlug: nextActivity.lessonSlug,
              lessonTitle: nextActivity.lessonTitle,
              completedAt: nextActivity.completedAt,
            },
          ],
          quizAttempts: [],
          tutorPrompts: [],
        })
      : nextActivity.type === "quiz_attempt"
        ? mergeLearningHistory(current, {
            conversionEvents: [],
            lessonCompletions: [],
            quizAttempts: [
              {
                lessonSlug: nextActivity.lessonSlug,
                lessonTitle: nextActivity.lessonTitle,
                correctCount: nextActivity.correctCount,
                totalQuestions: nextActivity.totalQuestions,
                passed: nextActivity.passed,
                attemptedAt: nextActivity.attemptedAt,
              } satisfies QuizAttemptRecord,
            ],
            tutorPrompts: [],
          })
        : nextActivity.type === "tutor_prompt"
          ? mergeLearningHistory(current, {
              conversionEvents: [],
              lessonCompletions: [],
              quizAttempts: [],
              tutorPrompts: [
                {
                  prompt: nextActivity.lessonTitle,
                  repliedAt: nextActivity.repliedAt,
                  responsePreview: nextActivity.responsePreview,
                  topic: nextActivity.topic,
                } satisfies TutorPromptRecord,
              ],
            })
          : mergeLearningHistory(current, {
              conversionEvents: [
                {
                  eventType: nextActivity.eventType,
                  occurredAt: nextActivity.occurredAt,
                  plan: nextActivity.plan,
                  source: nextActivity.source,
                  targetSlug: nextActivity.targetSlug,
                  targetTitle: nextActivity.targetTitle,
                } satisfies ConversionEventRecord,
              ],
              lessonCompletions: [],
              quizAttempts: [],
              tutorPrompts: [],
            });

  return writeCookieHistory(merged);
}
