import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectToDatabase from '../../../../lib/mongodb'
import { User } from '../../../../models'
import { getFileDb } from '../../../../lib/file-store'
import { checkRateLimit, getClientIp } from '../../../../lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const rateCheck = checkRateLimit(`login:${ip}`, 10, 60000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please wait ${rateCheck.resetInSeconds} seconds before trying again.` },
        { status: 429 }
      )
    }

    const { email, password } = await req.json()

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Valid email and password are required' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    // 1. Look in file store
    const db = getFileDb()
    let user: any = db.users.find((u: any) => u.email.toLowerCase() === cleanEmail)

    // 2. Also check MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        const mongoUser = await User.findOne({ email: cleanEmail }).select('+passwordHash')
        if (mongoUser) {
          user = {
            id: mongoUser._id.toString(),
            email: mongoUser.email,
            full_name: mongoUser.fullName,
            phone: mongoUser.phone,
            country: mongoUser.country,
            role: mongoUser.role,
            balance_cents: mongoUser.balanceCents,
            email_verified: mongoUser.emailVerified,
            passwordHash: mongoUser.passwordHash,
          }
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB login check note:', dbErr)
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Verify password hash with bcrypt
    if (!user.passwordHash) {
      // Superadmin initial seeded fallback
      if (cleanEmail === 'muskspacex.teslax@gmail.com' && password === 'teslax2026!') {
        user.passwordHash = await bcrypt.hash('teslax2026!', 10)
      } else {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name || user.fullName,
        phone: user.phone,
        country: user.country,
        role: user.role,
        balanceCents: user.balance_cents ?? user.balanceCents ?? 0,
        emailVerified: user.email_verified ?? user.emailVerified ?? true,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
