import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectToDatabase from '../../../../lib/mongodb'
import { User } from '../../../../models'
import { getFileDb, saveFileDb } from '../../../../lib/file-store'
import { checkRateLimit, getClientIp } from '../../../../lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const rateCheck = checkRateLimit(`signup:${ip}`, 5, 60000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many registration attempts. Please wait ${rateCheck.resetInSeconds} seconds before trying again.` },
        { status: 429 }
      )
    }

    const { email, password, fullName, phone, country } = await req.json()

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Email and full name are required' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    // 1. Check existing in local persistent file store
    const db = getFileDb()
    const existingInFile = db.users.find((u: any) => u.email.toLowerCase() === cleanEmail)
    if (existingInFile) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password is required and must be at least 8 characters' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Generate referral code e.g. TESLAX-ADA
    const codeSuffix = fullName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '')
    const referralCode = `TESLAX-${codeSuffix || Math.floor(1000 + Math.random() * 9000)}`
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000))

    const newUserData = {
      id: Date.now(),
      email: cleanEmail,
      passwordHash,
      full_name: fullName.trim(),
      phone: phone?.trim() || '',
      country: country?.trim() || 'United States',
      role: 'member',
      status: 'active',
      email_verified: false,
      verification_code: verificationCode,
      balance_cents: 0,
      referral_code: referralCode,
      created_at: Date.now(),
    }

    // Save to file store
    db.users.push(newUserData)
    saveFileDb(db)

    // 2. Mirror to MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        await User.create({
          email: cleanEmail,
          passwordHash,
          fullName: fullName.trim(),
          phone: phone?.trim(),
          country: country?.trim() || 'United States',
          role: 'member',
          status: 'active',
          emailVerified: false,
          verificationCode,
          balanceCents: 0,
          referralCode,
        })
      }
    } catch (dbErr) {
      console.warn('MongoDB user mirror deferred:', dbErr)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUserData.id,
        email: newUserData.email,
        fullName: newUserData.full_name,
        phone: newUserData.phone,
        country: newUserData.country,
        role: newUserData.role,
        balanceCents: newUserData.balance_cents,
        emailVerified: newUserData.email_verified,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
