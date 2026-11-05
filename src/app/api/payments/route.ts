import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '../../../lib/mongodb'
import { Payment, User } from '../../../models'
import { getFileDb, saveFileDb } from '../../../lib/file-store'

function mapPaymentDoc(p: any) {
  return {
    id: p._id?.toString() || p.id || p.reference,
    reference: p.reference,
    user_id: p.userId?._id?.toString() || p.userId?.toString() || p.user_id || 1,
    full_name: p.fullName || p.full_name || p.userId?.fullName || 'Member',
    email: p.email || p.userId?.email || '',
    amount_cents: p.amountCents ?? p.amount_cents ?? 0,
    method: p.method,
    status: p.status,
    created_at: typeof p.createdAt === 'string' ? new Date(p.createdAt).getTime() : p.created_at || Date.now(),
    reviewed_at: p.reviewedAt ? new Date(p.reviewedAt).getTime() : p.reviewed_at,
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  try {
    const conn = await connectToDatabase()
    if (conn) {
      let filter = {}
      if (email) {
        const user = await User.findOne({ email: email.toLowerCase() })
        if (user) filter = { userId: user._id }
      }
      const docs = await Payment.find(filter).sort({ createdAt: -1 }).populate('userId', 'email fullName')
      if (docs.length > 0) return NextResponse.json({ payments: docs.map(mapPaymentDoc) })
    }
  } catch (err) {
    // Fall through to file store
  }

  const db = getFileDb()
  let list = db.payments || []
  if (email) {
    list = list.filter((p: any) => String(p.email || '').toLowerCase() === email.toLowerCase())
  }
  return NextResponse.json({ payments: list.map(mapPaymentDoc) })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { reference, email, fullName, amount_cents, method } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    const amtNum = Number(amount_cents)
    if (isNaN(amtNum) || amtNum <= 0) {
      return NextResponse.json({ error: 'Valid positive amount_cents required' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const ref = reference || `TXP-${Math.floor(1000 + Math.random() * 9000)}`
    const isCard = String(method || '').toLowerCase().includes('card')

    // 1. Save to local file store
    const db = getFileDb()
    const newPayment = {
      id: Date.now(),
      reference: ref,
      user_id: 1,
      full_name: fullName || 'Member',
      email: cleanEmail,
      amount_cents: amtNum,
      method: method || 'bank transfer',
      status: isCard ? 'confirmed' : 'pending',
      created_at: Date.now(),
      reviewed_at: isCard ? Date.now() : undefined,
    }
    db.payments = db.payments || []
    db.payments.unshift(newPayment)

    // If card top-up, credit ONLY the matching user
    if (isCard) {
      db.users = db.users.map((u: any) => {
        if (u.email.toLowerCase() === cleanEmail) {
          return { ...u, balance_cents: (u.balance_cents || 0) + amtNum }
        }
        return u
      })
      db.ledger = db.ledger || []
      db.ledger.unshift({
        id: Date.now(),
        email: cleanEmail,
        delta_cents: amtNum,
        reason: `Card instant top-up (${ref})`,
        created_at: Date.now(),
      })
    }
    saveFileDb(db)

    // 2. Mirror to MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        const user = await User.findOne({ email: cleanEmail })

        if (user) {
          await Payment.create({
            reference: ref,
            userId: user._id,
            fullName: fullName || user.fullName,
            email: user.email,
            amountCents: amtNum,
            method: method || 'bank transfer',
            status: isCard ? 'confirmed' : 'pending',
            reviewedAt: isCard ? new Date() : undefined,
          })
          if (isCard) {
            user.balanceCents = (user.balanceCents || 0) + amtNum
            await user.save()
          }
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB payment mirror deferred:', dbErr)
    }

    return NextResponse.json({
      success: true,
      payment: mapPaymentDoc(newPayment),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, reference, status } = body

    const requesterEmail = req.headers.get('x-requester-email') || body.requesterEmail
    const isAdmin = requesterEmail?.toLowerCase() === 'muskspacex.teslax@gmail.com'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privilege required to review payments' }, { status: 403 })
    }

    // 1. Update in local file store
    const db = getFileDb()
    let updatedPayment: any = null
    let wasConfirmed = false

    db.payments = (db.payments || []).map((p: any) => {
      if (p.id === id || p.reference === reference || p.reference === id) {
        wasConfirmed = p.status === 'confirmed'
        updatedPayment = {
          ...p,
          status: status || 'confirmed',
          reviewed_at: Date.now(),
        }
        return updatedPayment
      }
      return p
    })

    // IDEMPOTENCY GUARD: Only credit funds if previous status was NOT confirmed
    if (updatedPayment && status === 'confirmed' && !wasConfirmed) {
      db.users = db.users.map((u: any) => {
        if (
          (updatedPayment.user_id && String(u.id) === String(updatedPayment.user_id)) ||
          (updatedPayment.email && u.email.toLowerCase() === updatedPayment.email.toLowerCase())
        ) {
          return { ...u, balance_cents: (u.balance_cents || 0) + updatedPayment.amount_cents }
        }
        return u
      })
      db.ledger = db.ledger || []
      db.ledger.unshift({
        id: Date.now(),
        email: updatedPayment.email,
        delta_cents: updatedPayment.amount_cents,
        reason: `Confirmed payment (${updatedPayment.reference})`,
        created_at: Date.now(),
      })
    }
    saveFileDb(db)

    // 2. Mirror to MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        const query: any = {}
        if (id && String(id).length === 24) query._id = id
        else if (reference) query.reference = reference
        else if (id) query.reference = id

        const payment = await Payment.findOne(query)
        if (payment) {
          const previousStatus = payment.status
          payment.status = status || 'confirmed'
          payment.reviewedAt = new Date()
          await payment.save()

          if (status === 'confirmed' && previousStatus !== 'confirmed') {
            const user = await User.findById(payment.userId)
            if (user) {
              user.balanceCents = (user.balanceCents || 0) + payment.amountCents
              await user.save()
            }
          }
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB payment patch deferred:', dbErr)
    }

    if (!updatedPayment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      payment: mapPaymentDoc(updatedPayment),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
