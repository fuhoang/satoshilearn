import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getTutorRequestLimit, hasProAccess } from "@/lib/billing";
import { checkRateLimit } from "@/lib/rate-limit";
import { createTutorReply, inferTutorTopic } from "@/lib/openai";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_MESSAGE_LENGTH = 500;
const CHAT_RATE_WINDOW_MS = 60_000;
const TUTOR_PROMPT_PREVIEW_MAX = 160;
const GUEST_TUTOR_REQUEST_LIMIT = 3;
const GUEST_TUTOR_COOKIE = "blockwise_guest_tutor_id";
const GUEST_LIMIT_ERROR =
  "You have used the guest AI demo for now. Log in to keep chatting.";

function buildTutorUsage(
  limit: number,
  limitResult: { remaining: number; resetAt: number },
) {
  return {
    limit,
    remaining: limitResult.remaining,
    resetAt: limitResult.resetAt,
  };
}

function buildRateLimitResponse(resetAt: number, error: string) {
  return NextResponse.json(
    { error },
    {
      status: 429,
      headers: {
        "Retry-After": String(
          Math.max(
            1,
            Math.ceil((resetAt - Date.now()) / 1000),
          ),
        ),
      },
    },
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 500 },
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = (await request.json()) as {
      message?: unknown;
      source?: unknown;
    };
    const message =
      typeof body.message === "string" ? body.message.trim() : "";
    const source = body.source === "home" ? "home" : "lesson";

    if (!message) {
      return NextResponse.json(
        { error: "Please enter a question before submitting." },
        { status: 400 },
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: "Please keep tutor questions under 500 characters." },
        { status: 400 },
      );
    }

    if (!user) {
      if (source !== "home") {
        return NextResponse.json(
          { error: "Log in to use the AI tutor." },
          { status: 401 },
        );
      }

      const cookieStore = await cookies();
      const existingGuestId = cookieStore.get(GUEST_TUTOR_COOKIE)?.value ?? null;
      const guestId = existingGuestId ?? crypto.randomUUID();
      const limitResult = checkRateLimit(
        `chat:guest:${guestId}`,
        GUEST_TUTOR_REQUEST_LIMIT,
        CHAT_RATE_WINDOW_MS,
      );

      if (!limitResult.allowed) {
        const response = buildRateLimitResponse(
          limitResult.resetAt,
          GUEST_LIMIT_ERROR,
        );

        if (!existingGuestId) {
          response.cookies.set(GUEST_TUTOR_COOKIE, guestId, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
            sameSite: "lax",
          });
        }

        return response;
      }

      const reply = await createTutorReply(message);
      const topic = inferTutorTopic(message);
      const response = NextResponse.json({
        reply,
        recordedAt: new Date().toISOString(),
        topic,
        usage: {
          ...buildTutorUsage(GUEST_TUTOR_REQUEST_LIMIT, limitResult),
          plan: "free" as const,
        },
      });

      if (!existingGuestId) {
        response.cookies.set(GUEST_TUTOR_COOKIE, guestId, {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
          sameSite: "lax",
        });
      }

      return response;
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select(
        "user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, plan_slug, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at",
      )
      .eq("user_id", user.id)
      .maybeSingle();

    const tutorRequestLimit = getTutorRequestLimit({
      configured: true,
      customerId: null,
      purchaseEvents: [],
      subscription: subscription ?? null,
    });

    const limitResult = checkRateLimit(
      `chat:${user.id}`,
      tutorRequestLimit,
      CHAT_RATE_WINDOW_MS,
    );

    if (!limitResult.allowed) {
      return buildRateLimitResponse(
        limitResult.resetAt,
        "You have reached the tutor limit for now. Please try again in a minute.",
      );
    }

    const reply = await createTutorReply(message);
    const topic = inferTutorTopic(message);
    const responsePreview = reply.slice(0, TUTOR_PROMPT_PREVIEW_MAX);
    const recordedAt = new Date().toISOString();

    void supabase.from("learning_activity").insert({
      activity_context: topic,
      activity_type: "tutor_prompt",
      created_at: recordedAt,
      lesson_slug: "ai-tutor",
      lesson_title: message,
      response_preview: responsePreview,
      user_id: user.id,
    });

    return NextResponse.json({
      reply,
      recordedAt,
      topic,
      usage: {
        ...buildTutorUsage(tutorRequestLimit, limitResult),
        plan: hasProAccess({
          configured: true,
          customerId: null,
          purchaseEvents: [],
          subscription: subscription ?? null,
        })
          ? "pro"
          : "free",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process your request right now." },
      { status: 500 },
    );
  }
}
