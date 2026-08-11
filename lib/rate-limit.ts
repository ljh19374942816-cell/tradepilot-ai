type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now(); const current = store.get(key);
  if (!current || current.resetAt <= now) { store.set(key, { count: 1, resetAt: now + windowMs }); return { allowed: true, remaining: limit - 1 }; }
  if (current.count >= limit) return { allowed: false, remaining: 0 };
  current.count += 1; return { allowed: true, remaining: limit - current.count };
}

export function requestKey(request: Request, scope: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${scope}:${forwarded || request.headers.get("x-real-ip") || "local"}`;
}
