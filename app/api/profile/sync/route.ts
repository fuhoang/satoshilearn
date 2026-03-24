import { NextResponse } from "next/server";

import { syncProfileForUser } from "@/lib/profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
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
      { error: "You must be logged in to sync your profile." },
      { status: 401 },
    );
  }

  const profile = await syncProfileForUser(user);

  if (!profile) {
    return NextResponse.json(
      { error: "Unable to sync your profile right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile });
}
