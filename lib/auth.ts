import { createServerSupabaseClient } from "@/lib/supabase/server";

const protectedPrefixes = ["/dashboard", "/learn", "/profiles", "/purchases"];
const authPrefixes = ["/auth/login", "/auth/register", "/auth/forgot-password"];

export function routeRequiresAuth(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function isAuthRoute(pathname: string) {
  return authPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
