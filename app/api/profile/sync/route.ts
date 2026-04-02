import { NextResponse } from "next/server";

import { syncProfileForUser } from "@/lib/profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
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
      { error: "You must be logged in to sync your profile." },
      { status: 401 },
    );
  }

  let profile;

  try {
    profile = await syncProfileForUser(user);
  } catch {
    return NextResponse.json(
      { error: "Unable to sync your profile right now." },
      { status: 503 },
    );
  }

  if (!profile) {
    return NextResponse.json(
      { error: "Unable to sync your profile right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile });
}
