import { NextRequest, NextResponse } from 'next/server'
import { getLiveMarketData } from '../../../../lib/market-service'
import { DEFAULT_CHARTS } from '../../../../lib/market'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = (searchParams.get('symbol') || searchParams.get('sym') || 'TSLA').toUpperCase()

  try {
    const data = await getLiveMarketData()
    const series = data.charts[symbol] || DEFAULT_CHARTS[symbol] || null
    const quote = data.quotes.find((q) => q.symbol === symbol) || null

    if (!series) {
      return NextResponse.json({ error: `Symbol ${symbol} not found` }, { status: 404 })
    }

    return NextResponse.json({
      symbol,
      series,
      points: series.points,
      quote,
      source: data.source,
      updatedAt: data.updatedAt,
    })
  } catch (err: any) {
    const fallbackSeries = DEFAULT_CHARTS[symbol] || null
    return NextResponse.json({
      symbol,
      series: fallbackSeries,
      points: fallbackSeries?.points || [],
      error: err.message,
      source: 'fallback',
      updatedAt: Date.now(),
    })
  }
}

