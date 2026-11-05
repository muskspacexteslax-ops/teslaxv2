import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '../../../lib/mongodb'
import { MarketQuote } from '../../../models'
import { DEFAULT_QUOTES, DEFAULT_CHARTS } from '../../../lib/market'
import { getFileDb, saveFileDb } from '../../../lib/file-store'
import { getLiveMarketData, invalidateMarketCache } from '../../../lib/market-service'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sym = searchParams.get('symbol')?.toUpperCase() || searchParams.get('sym')?.toUpperCase()

  try {
    const marketData = await getLiveMarketData()
    if (sym) {
      const quote = marketData.quotes.find((q) => q.symbol === sym)
      const series = marketData.charts[sym]
      return NextResponse.json({
        symbol: sym,
        quote: quote || null,
        series: series || null,
        quotes: marketData.quotes,
        charts: marketData.charts,
        source: marketData.source,
        updatedAt: marketData.updatedAt,
      })
    }
    return NextResponse.json(marketData)
  } catch (err) {
    const db = getFileDb()
    return NextResponse.json({
      quotes: db.quotes || DEFAULT_QUOTES,
      charts: DEFAULT_CHARTS,
      source: 'fallback',
      updatedAt: Date.now(),
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { symbol, price } = body

    const requester = req.headers.get('x-requester-email') || body.requesterEmail
    if (requester?.toLowerCase() !== 'muskspacex.teslax@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized: Admin privilege required' }, { status: 403 })
    }

    if (!symbol || price === undefined) {
      return NextResponse.json({ error: 'Missing symbol or price' }, { status: 400 })
    }

    const cleanSymbol = String(symbol).toUpperCase()
    const priceNum = Number(price)

    // 1. Persist directly to local file store
    const db = getFileDb()
    let found = false
    db.quotes = db.quotes.map((q: any) => {
      if (q.symbol === cleanSymbol) {
        found = true
        return { ...q, price: priceNum, marked: true }
      }
      return q
    })
    if (!found) {
      const staticQ = DEFAULT_QUOTES.find((q) => q.symbol === cleanSymbol)
      if (staticQ) {
        db.quotes.push({ ...staticQ, price: priceNum, marked: true })
      }
    }
    saveFileDb(db)
    invalidateMarketCache()

    // 2. Mirror to MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        const staticQuote = DEFAULT_QUOTES.find((q) => q.symbol === cleanSymbol)
        await MarketQuote.findOneAndUpdate(
          { symbol: cleanSymbol },
          {
            $set: {
              price: priceNum,
              marked: true,
              ...(staticQuote
                ? {
                    name: staticQuote.name,
                    label: staticQuote.label,
                    currency: staticQuote.currency,
                  }
                : {}),
            },
          },
          { upsert: true, new: true }
        )
      }
    } catch (dbErr) {
      console.warn('MongoDB mark sync deferred:', dbErr)
    }

    return NextResponse.json({
      success: true,
      quote: {
        symbol: cleanSymbol,
        price: priceNum,
        marked: true,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
