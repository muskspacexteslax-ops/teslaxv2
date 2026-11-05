import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '../../../../../lib/mongodb'
import { Otp, User } from '../../../../../models'
import { sendAdminAlert } from '../../../../../lib/mail'
import { getFileDb, saveFileDb } from '../../../../../lib/file-store'

const failedAttempts: Record<string, { count: number; lockedUntil: number }> = {}

export async function POST(req: NextRequest) {
  try {
    const { email, code, purpose } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanCode = String(code).trim()

    // 1. Strict format check: Must be exactly 6 digits
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      return NextResponse.json({ error: 'Verification code must be exactly 6 digits' }, { status: 400 })
    }

    // 2. Brute-force attempt limiter
    const attemptRecord = failedAttempts[cleanEmail]
    if (attemptRecord && attemptRecord.count >= 5 && Date.now() < attemptRecord.lockedUntil) {
      const waitSeconds = Math.ceil((attemptRecord.lockedUntil - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Too many failed attempts. Please wait ${waitSeconds}s or request a new code.` },
        { status: 429 }
      )
    }

    let validOtp = null
    let user = null

    // 3. Check local file store
    const db = getFileDb()
    let fileUser = (db.users || []).find((u: any) => u.email.toLowerCase() === cleanEmail)
    const isFileCodeMatch = Boolean(
      fileUser &&
      fileUser.verification_code &&
      String(fileUser.verification_code).trim() === cleanCode &&
      (!fileUser.verification_expires || Date.now() <= fileUser.verification_expires)
    )

    // 4. Check MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        const filter: any = {
          email: cleanEmail,
          code: cleanCode,
          verified: false,
        }
        if (purpose) filter.purpose = purpose

        validOtp = await Otp.findOne(filter)
        user = await User.findOne({ email: cleanEmail })
      }
    } catch (dbErr) {
      console.warn('[TeslaX OTP Verify] DB connection note:', dbErr)
    }

    const isMongoCodeMatch = Boolean(user && user.verificationCode && user.verificationCode === cleanCode)

    if (!validOtp && !isMongoCodeMatch && !isFileCodeMatch) {
      // Record failed attempt
      const curr = failedAttempts[cleanEmail] || { count: 0, lockedUntil: 0 }
      curr.count += 1
      if (curr.count >= 5) {
        curr.lockedUntil = Date.now() + 5 * 60 * 1000 // 5 minute lockout
      }
      failedAttempts[cleanEmail] = curr

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid verification code. Please check the code or request a new one.',
        },
        { status: 400 }
      )
    }

    // Reset failed attempts on success
    delete failedAttempts[cleanEmail]

    // Mark verified in file store
    db.users = db.users.map((u: any) => {
      if (u.email.toLowerCase() === cleanEmail) {
        return { ...u, email_verified: true, status: 'active', verification_code: undefined }
      }
      return u
    })
    saveFileDb(db)

    // Mark verified in MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        if (validOtp) {
          validOtp.verified = true
          await validOtp.save()
        }
        if (user) {
          user.emailVerified = true
          user.status = 'active'
          user.verificationCode = undefined
          await user.save()

          sendAdminAlert(
            `Member Verified: ${user.email}`,
            `<p><strong>${user.fullName}</strong> (${user.email}) has successfully verified their email.</p><p>Account Status: <strong>ACTIVE</strong></p>`
          ).catch(() => {})
        }
      }
    } catch (saveErr) {
      console.warn('[TeslaX OTP Verify] Status update note:', saveErr)
    }

    const resolvedUser = user || fileUser

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Email successfully verified',
      user: resolvedUser
        ? {
            id: resolvedUser._id || resolvedUser.id,
            email: resolvedUser.email,
            fullName: resolvedUser.fullName || resolvedUser.full_name,
            role: resolvedUser.role,
            status: 'active',
            emailVerified: true,
          }
        : null,
    })
  } catch (error: any) {
    console.error('Error in /api/auth/otp/verify:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
