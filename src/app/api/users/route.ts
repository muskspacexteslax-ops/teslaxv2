import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '../../../lib/mongodb'
import { User } from '../../../models'
import { getFileDb, saveFileDb } from '../../../lib/file-store'

function mapUserDoc(u: any) {
  return {
    id: u._id?.toString() || u.id,
    email: u.email,
    full_name: u.fullName || u.full_name,
    phone: u.phone || '',
    country: u.country || 'United States',
    role: u.role,
    status: u.status,
    email_verified: Boolean(u.emailVerified ?? u.email_verified),
    balance_cents: u.balanceCents ?? u.balance_cents ?? 0,
    address_line1: u.addressLine1 || u.address_line1 || '',
    city: u.city || '',
    referral_code: u.referralCode || u.referral_code || '',
    created_at: typeof u.createdAt === 'string' ? new Date(u.createdAt).getTime() : u.created_at || Date.now(),
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  const id = searchParams.get('id')
  const requesterEmail = req.headers.get('x-requester-email')
  const isAdmin = requesterEmail?.toLowerCase() === 'muskspacex.teslax@gmail.com'

  try {
    const conn = await connectToDatabase()
    if (conn) {
      if (id && String(id).length === 24) {
        const user = await User.findById(id)
        if (user) return NextResponse.json({ user: mapUserDoc(user) })
      }
      if (email) {
        const user = await User.findOne({ email: email.toLowerCase() })
        if (user) return NextResponse.json({ user: mapUserDoc(user) })
      }
      if (isAdmin) {
        const users = await User.find().sort({ createdAt: -1 })
        if (users.length > 0) return NextResponse.json({ users: users.map(mapUserDoc) })
      }
    }
  } catch (err) {
    // Fall through to file store
  }

  const db = getFileDb()
  if (id) {
    const found = (db.users || []).find((u: any) => String(u.id) === String(id))
    if (!found) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user: mapUserDoc(found) })
  }

  if (email) {
    const found = (db.users || []).find((u: any) => u.email.toLowerCase() === email.toLowerCase())
    if (!found) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user: mapUserDoc(found) })
  }

  // Only verified admins can list all users
  if (isAdmin) {
    return NextResponse.json({ users: (db.users || []).map(mapUserDoc) })
  }

  return NextResponse.json({ error: 'Unauthorized. Provide email or admin credentials.' }, { status: 401 })
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      id,
      email,
      delta_cents,
      balance_cents,
      status,
      role,
      email_verified,
      full_name,
      phone,
      country,
      address_line1,
      city,
    } = body

    const requesterEmail = req.headers.get('x-requester-email') || body.requesterEmail
    const isAdmin = requesterEmail?.toLowerCase() === 'muskspacex.teslax@gmail.com'

    // RESTRICT PRIVILEGED MUTATIONS: Only admins can alter role, status, or balance directly
    const isPrivileged = role !== undefined || balance_cents !== undefined || delta_cents !== undefined || status !== undefined
    if (isPrivileged && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative privilege required to alter user roles or wallet balances' },
        { status: 403 }
      )
    }

    // 1. Update in local file store
    const db = getFileDb()
    let updatedUser: any = null
    db.users = db.users.map((u: any) => {
      const match =
        (id && String(u.id) === String(id)) ||
        (email && u.email.toLowerCase() === String(email).toLowerCase())

      if (match) {
        let newBalance = u.balance_cents || 0
        if (delta_cents !== undefined) {
          newBalance = Math.max(0, newBalance + Number(delta_cents))
        }
        if (balance_cents !== undefined) {
          newBalance = Math.max(0, Number(balance_cents))
        }

        updatedUser = {
          ...u,
          balance_cents: newBalance,
          ...(status ? { status } : {}),
          ...(role ? { role } : {}),
          ...(email_verified !== undefined ? { email_verified: Boolean(email_verified) } : {}),
          ...(full_name ? { full_name } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(country ? { country } : {}),
          ...(address_line1 !== undefined ? { address_line1 } : {}),
          ...(city !== undefined ? { city } : {}),
        }
        return updatedUser
      }
      return u
    })
    saveFileDb(db)

    // 2. Mirror to MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        const query: any = {}
        if (id && String(id).length === 24) query._id = id
        else if (email) query.email = email.toLowerCase()

        const user = await User.findOne(query)
        if (user) {
          if (delta_cents !== undefined) {
            user.balanceCents = Math.max(0, (user.balanceCents || 0) + Number(delta_cents))
          }
          if (balance_cents !== undefined) {
            user.balanceCents = Math.max(0, Number(balance_cents))
          }
          if (status) user.status = status
          if (role) user.role = role
          if (email_verified !== undefined) user.emailVerified = Boolean(email_verified)
          if (full_name) user.fullName = full_name
          if (phone !== undefined) user.phone = phone
          if (country) user.country = country
          if (address_line1 !== undefined) user.addressLine1 = address_line1
          if (city !== undefined) user.city = city
          await user.save()
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB user patch deferred:', dbErr)
    }

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: mapUserDoc(updatedUser),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
