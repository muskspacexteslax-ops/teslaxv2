import { NextRequest } from 'next/server'

interface RateLimitRecord {
  timestamps: number[]
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Periodically clean stale records every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 300000)
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key)
      }
    }
  }, 300000)
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  const cfIp = req.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()
  return '127.0.0.1'
}

export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now()
  let record = rateLimitStore.get(identifier)

  if (!record) {
    record = { timestamps: [] }
    rateLimitStore.set(identifier, record)
  }

  // Filter out timestamps outside the active window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs)

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0]
    const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000))
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    }
  }

  record.timestamps.push(now)
  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    resetInSeconds: Math.ceil(windowMs / 1000),
  }
}

