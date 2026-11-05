import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '../../../../../lib/mongodb'
import { Otp, User } from '../../../../../models'
import { sendOtpEmail } from '../../../../../lib/mail'
import { getFileDb, saveFileDb } from '../../../../../lib/file-store'
import { checkRateLimit, getClientIp } from '../../../../../lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const rateCheck = checkRateLimit(`otp:${ip}`, 5, 60000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many verification requests. Please wait ${rateCheck.resetInSeconds} seconds before requesting a new code.` },
        { status: 429 }
      )
    }

    const { email, purpose = 'verify', fullName } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    // Generate secure 6-digit OTP code
    const code = String(Math.floor(100000 + Math.random() * 900000))

    let existingFullName = fullName

    // 1. Save code to local persistent file store with 10-minute expiration
    const db = getFileDb()
    const otpExpires = Date.now() + 10 * 60 * 1000
    let found = false
    db.users = (db.users || []).map((u: any) => {
      if (u.email.toLowerCase() === cleanEmail) {
        found = true
        existingFullName = existingFullName || u.full_name || u.fullName
        return { ...u, verification_code: code, verification_expires: otpExpires }
      }
      return u
    })

    if (!found) {
      // If user wasn't in db yet, create record
      db.users.push({
        id: Date.now(),
        email: cleanEmail,
        full_name: fullName || 'Member',
        role: 'member',
        status: 'active',
        email_verified: false,
        verification_code: code,
        verification_expires: otpExpires,
        balance_cents: 0,
        created_at: Date.now(),
      })
    }
    saveFileDb(db)

    // 2. Save to MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        await Otp.deleteMany({ email: cleanEmail, purpose })
        await Otp.create({
          email: cleanEmail,
          code,
          purpose,
          verified: false,
        })
        const existingUser = await User.findOne({ email: cleanEmail })
        if (existingUser) {
          existingUser.verificationCode = code
          existingFullName = existingFullName || existingUser.fullName
          await existingUser.save()
        }
      }
    } catch (dbErr) {
      console.warn('[TeslaX OTP] MongoDB storage note:', dbErr)
    }

    // 3. Attempt email dispatch via Google SMTP
    let smtpError: string | undefined = undefined
    try {
      const mailResult = await sendOtpEmail(cleanEmail, code, {
        fullName: existingFullName,
        purpose,
      })
      if (!mailResult.success) {
        smtpError = mailResult.error
        console.warn('[TeslaX OTP] SMTP dispatch warning:', mailResult.error)
      }
    } catch (err: any) {
      smtpError = err.message
      console.warn('[TeslaX OTP] SMTP exception:', err)
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      smtpWarning: smtpError,
    })
  } catch (error: any) {
    console.error('Error in /api/auth/otp/send:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
