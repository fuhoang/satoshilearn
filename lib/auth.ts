import { createServerSupabaseClient } from "@/lib/supabase/server";

export const protectedPrefixes = [
  "/dashboard",
  "/learn",
  "/profiles",
  "/purchases",
] as const;
export const authPrefixes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
] as const;
export const authProxyPrefixes = [...protectedPrefixes, "/auth"] as const;

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
