import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/rate-limit";
import { createTutorReply } from "@/lib/openai";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_MESSAGE_LENGTH = 500;
const CHAT_RATE_LIMIT = 10;
const CHAT_RATE_WINDOW_MS = 60_000;

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

    if (!user) {
      return NextResponse.json(
        { error: "Log in to use the AI tutor." },
        { status: 401 },
      );
    }

    const limitResult = checkRateLimit(
      `chat:${user.id}`,
      CHAT_RATE_LIMIT,
      CHAT_RATE_WINDOW_MS,
    );

    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: "You have reached the tutor limit for now. Please try again in a minute." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(
                1,
                Math.ceil((limitResult.resetAt - Date.now()) / 1000),
              ),
            ),
          },
        },
      );
    }

    const body = (await request.json()) as { message?: unknown };
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

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

    const reply = await createTutorReply(message);

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Unable to process your request right now." },
      { status: 500 },
    );
  }
}
