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

function normalizeOrigin(origin: string) {
  return origin.replace(/\/$/, "");
}

function isLocalOrigin(origin: string) {
  try {
    const url = new URL(normalizeOrigin(origin));
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function buildAuthCallbackUrl(origin: string, nextPath?: string | null) {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  const isProduction = process.env.NODE_ENV === "production";
  const baseOrigin = isLocalOrigin(origin)
    ? origin
    : configuredOrigin && isProduction
      ? configuredOrigin
      : origin;
  const callbackUrl = new URL(
    "/auth/callback",
    normalizeOrigin(baseOrigin),
  );
  callbackUrl.searchParams.set("next", sanitizeNextPath(nextPath));
  return callbackUrl.toString();
}
