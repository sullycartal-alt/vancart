// In-memory rate limiter — works per serverless instance.
// Provides burst protection; for strict cross-instance limits use Redis.
const store = new Map<string, { count: number; reset: number }>()

// Prune stale entries every 2 minutes to avoid unbounded memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, val] of store) {
      if (now > val.reset + 60_000) store.delete(key)
    }
  }, 120_000)
}

export function checkRateLimit(
  ip: string,
  limit = 10,
  windowMs = 60_000,
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now > entry.reset) {
    store.set(ip, { count: 1, reset: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfter: 0 }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.reset - now) / 1000) }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, retryAfter: 0 }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? '127.0.0.1'
}
