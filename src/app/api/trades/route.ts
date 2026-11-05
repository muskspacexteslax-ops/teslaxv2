import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '../../../lib/mongodb'
import { Holding, TradeTransaction, LedgerEntry, User } from '../../../models'
import { getFileDb, saveFileDb } from '../../../lib/file-store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  try {
    const conn = await connectToDatabase()
    if (conn) {
      let user = null
      if (email) user = await User.findOne({ email: email.toLowerCase() })

      if (user) {
        const [holdings, trades, ledger] = await Promise.all([
          Holding.find({ userId: user._id }),
          TradeTransaction.find({ userId: user._id }).sort({ createdAt: -1 }),
          LedgerEntry.find({ userId: user._id }).sort({ createdAt: -1 }),
        ])

        return NextResponse.json({
          holdings: holdings.map((h: any) => ({
            symbol: h.symbol,
            shares: h.shares,
            cost_basis_cents: h.costBasisCents,
          })),
          trades: trades.map((t: any) => ({
            id: t._id?.toString(),
            email: user.email,
            symbol: t.symbol,
            side: t.side,
            shares: t.shares,
            price_cents: t.priceCents,
            total_cents: t.totalCents,
            created_at: new Date(t.createdAt).getTime(),
          })),
          ledger: ledger.map((l: any) => ({
            id: l._id?.toString(),
            email: user.email,
            delta_cents: l.deltaCents,
            reason: l.reason,
            created_at: new Date(l.createdAt).getTime(),
          })),
        })
      }
    }
  } catch (err) {
    // Fall through to file store
  }

  const db = getFileDb()
  const cleanEmail = email ? email.toLowerCase().trim() : ''
  const userTrades = cleanEmail ? (db.trades || []).filter((t: any) => t.email?.toLowerCase() === cleanEmail) : []
  const userLedger = cleanEmail ? (db.ledger || []).filter((l: any) => l.email?.toLowerCase() === cleanEmail) : []

  return NextResponse.json({
    holdings: [],
    trades: userTrades,
    ledger: userLedger,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, symbol, side, shares, price_cents, total_cents } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    if (!symbol || (side !== 'buy' && side !== 'sell')) {
      return NextResponse.json({ error: 'Valid symbol and side (buy/sell) required' }, { status: 400 })
    }

    const sharesNum = Number(shares)
    const totalCentsNum = Number(total_cents)
    const priceCentsNum = Number(price_cents)

    if (
      isNaN(sharesNum) ||
      sharesNum <= 0.0001 ||
      isNaN(totalCentsNum) ||
      totalCentsNum <= 0 ||
      isNaN(priceCentsNum) ||
      priceCentsNum <= 0
    ) {
      return NextResponse.json({ error: 'Shares, price, and total must be positive numbers' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const db = getFileDb()
    const user = db.users.find((u: any) => u.email.toLowerCase() === cleanEmail)

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // 1. Balance verification for BUY orders
    if (side === 'buy') {
      if ((user.balance_cents || 0) < totalCentsNum) {
        return NextResponse.json(
          { error: `Insufficient wallet balance ($${((user.balance_cents || 0) / 100).toFixed(2)}). Top up to purchase.` },
          { status: 400 }
        )
      }
    }

    // 2. Holdings verification for SELL orders
    if (side === 'sell') {
      const userTrades = (db.trades || [])
        .filter((t: any) => t.symbol === symbol && t.email?.toLowerCase() === cleanEmail)
        .sort((a: any, b: any) => (a.created_at || 0) - (b.created_at || 0))

      let heldShares = 0
      for (const t of userTrades) {
        if (t.side === 'buy') heldShares += t.shares
        else heldShares = Math.max(0, heldShares - t.shares)
      }

      if (heldShares < sharesNum - 0.0001) {
        return NextResponse.json(
          { error: `Insufficient holdings. You only hold ${heldShares.toFixed(4)} shares of ${symbol}.` },
          { status: 400 }
        )
      }
    }

    const newTx = {
      id: Date.now(),
      email: cleanEmail,
      symbol,
      side,
      shares: sharesNum,
      price_cents: priceCentsNum,
      total_cents: totalCentsNum,
      created_at: Date.now(),
    }
    db.trades = db.trades || []
    db.trades.unshift(newTx)

    // Update user balance in file store
    const delta = side === 'buy' ? -totalCentsNum : totalCentsNum
    db.users = db.users.map((u: any) => {
      if (u.email.toLowerCase() === cleanEmail) {
        return { ...u, balance_cents: Math.max(0, (u.balance_cents || 0) + delta) }
      }
      return u
    })
    db.ledger = db.ledger || []
    db.ledger.unshift({
      id: Date.now(),
      email: cleanEmail,
      delta_cents: delta,
      reason: `${side === 'buy' ? 'Bought' : 'Sold'} ${sharesNum.toFixed(4)} ${symbol}`,
      created_at: Date.now(),
    })
    saveFileDb(db)

    // 2. Mirror to MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        const mongoUser = await User.findOne({ email: cleanEmail })
        if (mongoUser) {
          if (side === 'buy' && (mongoUser.balanceCents || 0) < totalCentsNum) {
            // Already validated in file store, but double check
            mongoUser.balanceCents = Math.max(0, (mongoUser.balanceCents || 0) - totalCentsNum)
          } else {
            mongoUser.balanceCents = Math.max(0, (mongoUser.balanceCents || 0) + delta)
          }
          await mongoUser.save()

          await TradeTransaction.create({
            userId: mongoUser._id,
            symbol,
            side,
            shares: sharesNum,
            priceCents: priceCentsNum,
            totalCents: totalCentsNum,
          })

          await LedgerEntry.create({
            userId: mongoUser._id,
            deltaCents: delta,
            reason: `${side === 'buy' ? 'Bought' : 'Sold'} ${sharesNum.toFixed(4)} ${symbol}`,
          })
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB trade mirror deferred:', dbErr)
    }

    return NextResponse.json({
      success: true,
      trade: newTx,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
