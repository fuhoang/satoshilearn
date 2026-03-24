import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

function sanitizeDisplayName(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 50) : null;
}

export async function POST(request: Request) {
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
      { error: "You must be logged in to update your profile." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as { display_name?: unknown };
  const displayName = sanitizeDisplayName(body.display_name);

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        display_name: displayName,
      },
      { onConflict: "id" },
    )
    .select("id, email, display_name, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Unable to update your profile right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile: data });
}
