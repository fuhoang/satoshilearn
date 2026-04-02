import { NextResponse } from "next/server";

import { getSupabaseBrowserEnv } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function sanitizeDisplayName(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 50) : null;
}

function sanitizeShortText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, maxLength) : null;
}

function sanitizeAvatarUrl(value: unknown, userId: string) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const env = getSupabaseBrowserEnv();

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    if (
      !env ||
      !url.toString().startsWith(
        `${env.url}/storage/v1/object/public/avatars/`,
      )
    ) {
      return null;
    }

    const prefix = `${env.url}/storage/v1/object/public/avatars/${userId}/`;

    if (!url.toString().startsWith(prefix)) {
      return null;
    }

    return url.toString().slice(0, 500);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let supabase;

  try {
    supabase = await createServerSupabaseClient();
  } catch {
    return NextResponse.json(
      { error: "Unable to reach Supabase right now." },
      { status: 503 },
    );
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  let user;

  try {
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch {
    return NextResponse.json(
      { error: "Unable to verify your account right now." },
      { status: 503 },
    );
  }

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to update your profile." },
      { status: 401 },
    );
  }

  let body: {
    avatar_url?: unknown;
    bio?: unknown;
    display_name?: unknown;
    timezone?: unknown;
  };

  try {
    body = (await request.json()) as {
      avatar_url?: unknown;
      bio?: unknown;
      display_name?: unknown;
      timezone?: unknown;
    };
  } catch {
    return NextResponse.json(
      { error: "Send a valid profile update body." },
      { status: 400 },
    );
  }
  const displayName = sanitizeDisplayName(body.display_name);
  const avatarUrl = sanitizeAvatarUrl(body.avatar_url, user.id);
  const bio = sanitizeShortText(body.bio, 240);
  const timezone = sanitizeShortText(body.timezone, 100);

  let data;
  let error;

  try {
    ({ data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          avatar_url: avatarUrl,
          bio,
          id: user.id,
          email: user.email ?? null,
          display_name: displayName,
          timezone,
        },
        { onConflict: "id" },
      )
      .select("id, email, display_name, avatar_url, bio, timezone, created_at")
      .single());
  } catch {
    return NextResponse.json(
      { error: "Unable to update your profile right now." },
      { status: 503 },
    );
  }

  if (error) {
    const message =
      error.message.includes("column") || error.code === "PGRST204"
        ? "Your Supabase profiles table is missing the latest profile fields. Rerun supabase/schema.sql and try again."
        : "Unable to update your profile right now.";

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile: data });
}
