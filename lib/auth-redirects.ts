export function sanitizeNextPath(nextPath?: string | null) {
  if (!nextPath) {
    return "/learn";
  }

  // Only allow app-internal absolute paths to avoid open redirects.
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/learn";
  }

  return nextPath;
}

export function buildAuthCallbackUrl(origin: string, nextPath?: string | null) {
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", sanitizeNextPath(nextPath));
  return callbackUrl.toString();
}
