import { DEFAULT_QUOTES, DEFAULT_CHARTS, type Quote, type Series, type SeriesPoint } from './market'
import { getFileDb } from './file-store'

interface CachedMarketData {
  quotes: Quote[]
  charts: Record<string, Series>
  source: string
  updatedAt: number
}

let memoryCache: CachedMarketData | null = null
const CACHE_TTL_MS = 25000 // 25 second cache to respect Finnhub free rate limits

export function invalidateMarketCache() {
  memoryCache = null
}

export async function getLiveMarketData(): Promise<CachedMarketData> {
  const now = Date.now()
  if (memoryCache && now - memoryCache.updatedAt < CACHE_TTL_MS) {
    return memoryCache
  }

  const finnhubKey = process.env.FINNHUB_API_KEY || 'dbm6ab9r01qpfa634ol0dbm6ab9r01qpfa634olg'
  const db = getFileDb()
  const dbQuotes: Quote[] = db.quotes || DEFAULT_QUOTES

  let tslaQuote: Quote = {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    label: 'Tesla Common Stock',
    price: 385.19,
    change: -13.31,
    changePct: -3.34,
    currency: 'USD',
    marked: false,
  }

  let tslaPoints: SeriesPoint[] = []
  let usedSource = 'fallback'

  // 1. Fetch live quote from Finnhub
  if (finnhubKey) {
    try {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=TSLA&token=${finnhubKey}`, {
        next: { revalidate: 20 },
      })
      if (res.ok) {
        const data = await res.json()
        if (data && typeof data.c === 'number' && data.c > 0) {
          tslaQuote = {
            symbol: 'TSLA',
            name: 'Tesla, Inc.',
            label: 'Tesla Common Stock',
            price: Math.round(data.c * 100) / 100,
            change: Math.round((data.d ?? 0) * 100) / 100,
            changePct: Math.round((data.dp ?? 0) * 100) / 100,
            currency: 'USD',
            marked: false,
          }
          usedSource = 'finnhub'
        }
      }
    } catch (err) {
      console.warn('Finnhub quote fetch deferred to fallback:', err)
    }
  }

  // 2. Fetch 30-day historical chart points from Yahoo Finance
  try {
    const yRes = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/TSLA?range=1mo&interval=1d',
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 60 },
      }
    )
    if (yRes.ok) {
      const yData = await yRes.json()
      const chartRes = yData?.chart?.result?.[0]
      if (chartRes?.timestamp && chartRes?.indicators?.quote?.[0]?.close) {
        const timestamps: number[] = chartRes.timestamp
        const closes: (number | null)[] = chartRes.indicators.quote[0].close
        const valid: SeriesPoint[] = []

        for (let i = 0; i < timestamps.length; i++) {
          const c = closes[i]
          if (typeof c === 'number' && !isNaN(c) && c > 0) {
            valid.push({
              t: timestamps[i] * 1000,
              c: Math.round(c * 100) / 100,
            })
          }
        }

        if (valid.length > 0) {
          // Sync the final point with the live quote price
          valid[valid.length - 1].c = tslaQuote.price
          tslaPoints = valid
          usedSource = usedSource === 'finnhub' ? 'finnhub+yahoo' : 'yahoo'
        }
      }
    }
  } catch (err) {
    console.warn('Yahoo historical chart fetch deferred to fallback:', err)
  }

  // Fallback to calibrated default series if network points are unavailable
  if (tslaPoints.length === 0) {
    const defaultTsla = DEFAULT_CHARTS['TSLA']?.points || []
    tslaPoints = defaultTsla.map((p, idx) => ({
      t: now - (defaultTsla.length - 1 - idx) * 86400000,
      c: idx === defaultTsla.length - 1 ? tslaQuote.price : p.c,
    }))
  }

  // 3. Resolve Marked Valuations for SPCX (SpaceX) & X (X Corp)
  const spcxDb = dbQuotes.find((q) => q.symbol === 'SPCX')
  const xDb = dbQuotes.find((q) => q.symbol === 'X')

  const spcxPrice = spcxDb ? spcxDb.price : 185.0
  const xPrice = xDb ? xDb.price : 44.0

  const spcxQuote: Quote = {
    symbol: 'SPCX',
    name: 'SpaceX',
    label: 'Space Exploration Technologies Corp.',
    price: spcxPrice,
    change: spcxDb?.change ?? 0,
    changePct: spcxDb?.changePct ?? 0,
    currency: 'USD',
    marked: true,
  }

  const xQuote: Quote = {
    symbol: 'X',
    name: 'X Corp.',
    label: 'X Holdings Corp. (Private Index)',
    price: xPrice,
    change: xDb?.change ?? 0,
    changePct: xDb?.changePct ?? 0,
    currency: 'USD',
    marked: true,
  }

  // Anchor SPCX and X series to their admin mark prices
  const spcxBase = DEFAULT_CHARTS['SPCX']?.points || []
  const spcxPoints: SeriesPoint[] = spcxBase.map((p, idx) => {
    const ratio = spcxPrice / 185.0
    return {
      t: now - (spcxBase.length - 1 - idx) * 86400000,
      c: Math.round(p.c * ratio * 100) / 100,
    }
  })

  const xBase = DEFAULT_CHARTS['X']?.points || []
  const xPoints: SeriesPoint[] = xBase.map((p, idx) => {
    const ratio = xPrice / 44.0
    return {
      t: now - (xBase.length - 1 - idx) * 86400000,
      c: Math.round(p.c * ratio * 100) / 100,
    }
  })

  const result: CachedMarketData = {
    quotes: [tslaQuote, spcxQuote, xQuote],
    charts: {
      TSLA: { symbol: 'TSLA', points: tslaPoints },
      SPCX: { symbol: 'SPCX', points: spcxPoints },
      X: { symbol: 'X', points: xPoints },
    },
    source: usedSource,
    updatedAt: now,
  }

  memoryCache = result
  return result
}
