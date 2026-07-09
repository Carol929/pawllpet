import { NextRequest } from 'next/server'

// Lightweight in-memory sliding-window rate limiter.
//
// This is a best-effort defense-in-depth measure: on a horizontally-scaled
// serverless host each instance keeps its own counters, so it does not give a
// hard global guarantee. It still raises the cost of credential/code brute
// force by orders of magnitude and is safe to deploy with no infra changes.
// For a hard global limit, back `hits`/`record` with a shared store (Redis /
// Upstash) — the call sites do not need to change.

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Opportunistically drop expired buckets so the map does not grow unbounded.
function sweep(now: number) {
  if (buckets.size < 5000) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfterSeconds: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { ok: true, remaining: limit - bucket.count, retryAfterSeconds: 0 }
}

// Best-effort client IP from the standard proxy headers Vercel sets.
export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}
