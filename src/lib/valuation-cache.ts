interface CachedValuation {
  valuation: any
  timestamp: number
}

// In-memory LRU-style valuation cache with 24-hour TTL
const cache = new Map<string, CachedValuation>()
const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export function getValuationCacheKey(input: {
  make: string
  model: string
  year: number | string
  mileage: number | string
  condition?: string
  fuel?: string
  transmission?: string
}): string {
  const makeNorm = String(input.make || '').trim().toLowerCase()
  const modelNorm = String(input.model || '').trim().toLowerCase()
  const yearNorm = String(input.year || '').trim()
  const mi = Number(input.mileage) || 0
  
  // Group mileage into 2,500-mile buckets (e.g. 64,800 mi and 65,200 mi share the same valuation)
  const miBucket = Math.round(mi / 2500) * 2500
  const cond = (input.condition || 'good').toLowerCase()
  const fuel = (input.fuel || 'petrol').toLowerCase()
  const trans = (input.transmission || 'automatic').toLowerCase()

  return `${makeNorm}:${modelNorm}:${yearNorm}:${miBucket}:${cond}:${fuel}:${trans}`
}

export function getCachedValuation(key: string): any | null {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() - item.timestamp > TTL_MS) {
    cache.delete(key)
    return null
  }
  return item.valuation
}

export function setCachedValuation(key: string, valuation: any): void {
  // Prune oldest entries if cache exceeds 1,000 vehicles
  if (cache.size > 1000) {
    const firstKey = cache.keys().next().value
    if (firstKey) cache.delete(firstKey)
  }
  cache.set(key, { valuation, timestamp: Date.now() })
}

