type RateLimitWindow = {
  count: number;
  resetAt: number;
};

const windows = new Map<string, RateLimitWindow>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
) {
  const now = Date.now();
  const current = windows.get(key);

  if (!current || current.resetAt <= now) {
    const nextWindow = {
      count: 1,
      resetAt: now + windowMs,
    };

    windows.set(key, nextWindow);

    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: nextWindow.resetAt,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;
  windows.set(key, current);

  return {
    allowed: true,
    remaining: limit - current.count,
    resetAt: current.resetAt,
  };
}

export function resetRateLimitState() {
  windows.clear();
}
