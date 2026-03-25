import { NextResponse } from "next/server";

import { sanitizeNextPath } from "@/lib/auth-redirects";
import { syncProfileForUser } from "@/lib/profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = sanitizeNextPath(url.searchParams.get("next"));
  const redirectUrl = new URL(nextPath, url.origin);
  const supabase = await createServerSupabaseClient();

  if (!code || !supabase) {
    return NextResponse.redirect(redirectUrl);
  }

  await supabase.auth.exchangeCodeForSession(code);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await syncProfileForUser(user);
  }

  return NextResponse.redirect(redirectUrl);
}
