import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getSupabaseBrowserEnv } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getSupabaseAuthCookiePrefixes() {
  const env = getSupabaseBrowserEnv();

  if (!env) {
    return [];
  }

  const projectRef = new URL(env.url).hostname.split(".")[0];
  const storageKey = `sb-${projectRef}-auth-token`;

  return [storageKey, `${storageKey}-code-verifier`];
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const response = NextResponse.redirect(new URL("/", request.url));

  if (supabase) {
    await supabase.auth.signOut();
  }

  const cookieStore = await cookies();
  const prefixes = getSupabaseAuthCookiePrefixes();

  for (const { name } of cookieStore.getAll()) {
    if (prefixes.some((prefix) => name === prefix || name.startsWith(`${prefix}.`))) {
      response.cookies.set(name, "", {
        maxAge: 0,
        path: "/",
      });
    }
  }

  return response;
}
