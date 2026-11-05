import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '../../../lib/mongodb'
import { Swap, User } from '../../../models'
import { sendAdminAlert } from '../../../lib/mail'
import { getFileDb, saveFileDb } from '../../../lib/file-store'

function mapSwapDoc(s: any) {
  return {
    id: s._id?.toString() || s.id || s.ref,
    ref: s.ref,
    user_id: s.userId?._id?.toString() || s.userId?.toString() || s.user_id || 1,
    email: s.userId?.email || s.email,
    fullName: s.userId?.fullName || s.fullName || s.full_name,
    make: s.make,
    model: s.model,
    year: s.year,
    mileage: s.mileage,
    fuel: s.fuel,
    transmission: s.transmission,
    condition: s.condition,
    owners: s.owners,
    service_history: s.serviceHistory || s.service_history || 'full',
    accident_history: s.accidentHistory || s.accident_history || 'none',
    target_slug: s.targetSlug || s.target_slug,
    target_name: s.targetName || s.target_name,
    estimate_low: s.estimateLow ?? s.estimate_low,
    estimate_mid: s.estimateMid ?? s.estimate_mid,
    estimate_high: s.estimateHigh ?? s.estimate_high,
    offer_cents: s.offerCents ?? s.offer_cents ?? 0,
    gap_cents: s.gapCents ?? s.gap_cents ?? 0,
    months: s.months || 36,
    monthly_cents: s.monthlyCents ?? s.monthly_cents ?? 0,
    status: s.status,
    notes: s.notes || '',
    admin_note: s.adminNote || s.admin_note || '',
    created_at: typeof s.createdAt === 'string' ? new Date(s.createdAt).getTime() : s.created_at || Date.now(),
    updated_at: typeof s.updatedAt === 'string' ? new Date(s.updatedAt).getTime() : s.updated_at || Date.now(),
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  const ref = searchParams.get('ref')
  const requesterEmail = req.headers.get('x-requester-email')
  const isAdmin = requesterEmail?.toLowerCase() === 'muskspacex.teslax@gmail.com'

  try {
    const conn = await connectToDatabase()
    if (conn) {
      if (ref) {
        const swap = await Swap.findOne({ ref }).populate('userId', 'email fullName phone')
        if (swap) return NextResponse.json({ swap: mapSwapDoc(swap) })
      } else {
        let filter: any = {}
        if (email) {
          const user = await User.findOne({ email: email.toLowerCase() })
          if (user) filter = { userId: user._id }
          else filter = { _id: null }
        } else if (!isAdmin) {
          return NextResponse.json({ swaps: [] })
        }
        const swaps = await Swap.find(filter).sort({ createdAt: -1 }).populate('userId', 'email fullName')
        if (swaps.length > 0) return NextResponse.json({ swaps: swaps.map(mapSwapDoc) })
      }
    }
  } catch (err) {
    // Fall through to file store
  }

  const db = getFileDb()
  if (ref) {
    const found = (db.swaps || []).find((s: any) => s.ref === ref)
    if (!found) return NextResponse.json({ error: 'Swap not found' }, { status: 404 })
    return NextResponse.json({ swap: mapSwapDoc(found) })
  }

  let list = db.swaps || []
  if (email) {
    list = list.filter((s: any) => String(s.email || '').toLowerCase() === email.toLowerCase())
  } else if (!isAdmin) {
    list = []
  }
  return NextResponse.json({ swaps: list.map(mapSwapDoc) })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = getFileDb()
    const ref = body.ref || `TX-${9000 + db.swaps.length + 1}`

    const newSwapItem = {
      id: Date.now(),
      ref,
      user_id: body.user_id || 1,
      email: body.email,
      fullName: body.fullName,
      make: body.make || 'Toyota',
      model: body.model || 'Corolla',
      year: Number(body.year) || 2020,
      mileage: Number(body.mileage) || 30000,
      fuel: body.fuel || 'petrol',
      transmission: body.transmission || 'automatic',
      condition: body.condition || 'good',
      owners: Number(body.owners) || 1,
      service_history: body.serviceHistory || body.service_history || 'full',
      accident_history: body.accidentHistory || body.accident_history || 'none',
      target_slug: body.targetSlug || body.target_slug || 'model-3',
      target_name: body.targetName || body.target_name || 'Model 3',
      estimate_low: Number(body.estimateLow || body.estimate_low) || 2000000,
      estimate_mid: Number(body.estimateMid || body.estimate_mid) || 2300000,
      estimate_high: Number(body.estimateHigh || body.estimate_high) || 2500000,
      offer_cents: Number(body.offerCents || body.offer_cents) || 0,
      gap_cents: Number(body.gapCents || body.gap_cents) || 0,
      months: Number(body.months) || 36,
      monthly_cents: Number(body.monthlyCents || body.monthly_cents) || 0,
      notes: body.notes || '',
      status: 'submitted',
      created_at: Date.now(),
      updated_at: Date.now(),
    }

    // 1. Save to file store
    db.swaps.unshift(newSwapItem)
    saveFileDb(db)

    // 2. Mirror to MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        let user = null
        if (body.email) {
          user = await User.findOne({ email: body.email.toLowerCase() })
          if (!user) {
            user = await User.create({
              email: body.email.toLowerCase(),
              fullName: body.fullName || 'New Member',
              phone: body.phone || '',
              country: body.country || 'United States',
              role: 'member',
              status: 'active',
              emailVerified: false,
            })
          }
        }
        await Swap.create({
          ref,
          userId: user?._id,
          make: newSwapItem.make,
          model: newSwapItem.model,
          year: newSwapItem.year,
          mileage: newSwapItem.mileage,
          fuel: newSwapItem.fuel,
          transmission: newSwapItem.transmission,
          condition: newSwapItem.condition,
          owners: newSwapItem.owners,
          serviceHistory: newSwapItem.service_history,
          accidentHistory: newSwapItem.accident_history,
          targetSlug: newSwapItem.target_slug,
          targetName: newSwapItem.target_name,
          estimateLow: newSwapItem.estimate_low,
          estimateMid: newSwapItem.estimate_mid,
          estimateHigh: newSwapItem.estimate_high,
          offerCents: newSwapItem.offer_cents,
          gapCents: newSwapItem.gap_cents,
          months: newSwapItem.months,
          monthlyCents: newSwapItem.monthly_cents,
          notes: newSwapItem.notes,
          status: 'submitted',
        })
      }
    } catch (dbErr) {
      console.warn('MongoDB swap mirror deferred:', dbErr)
    }

    // Send concierge alert
    sendAdminAlert(
      `New Car Swap Application: ${ref} (${newSwapItem.make} ${newSwapItem.model} → ${newSwapItem.target_name})`,
      `<p>A new vehicle swap application was submitted:</p>
       <ul>
         <li><strong>Reference:</strong> ${ref}</li>
         <li><strong>Car:</strong> ${newSwapItem.year} ${newSwapItem.make} ${newSwapItem.model}</li>
         <li><strong>Target:</strong> ${newSwapItem.target_name}</li>
       </ul>`
    ).catch(() => null)

    return NextResponse.json({
      success: true,
      ref,
      swap: mapSwapDoc(newSwapItem),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { ref, status, offer_cents, gap_cents, admin_note, notes } = body

    if (!ref) {
      return NextResponse.json({ error: 'Missing swap reference' }, { status: 400 })
    }

    const requesterEmail = req.headers.get('x-requester-email') || body.requesterEmail
    const isAdmin = requesterEmail?.toLowerCase() === 'muskspacex.teslax@gmail.com'

    // RESTRICT PRIVILEGED UPDATES: Only admins can alter valuation offers, gap amount, or approval status
    const isPrivileged = status !== undefined || offer_cents !== undefined || gap_cents !== undefined || admin_note !== undefined
    if (isPrivileged && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin privilege required to alter valuation offers or approve swap' },
        { status: 403 }
      )
    }

    // 1. Update in file store
    const db = getFileDb()
    let updatedSwap: any = null
    db.swaps = db.swaps.map((sw: any) => {
      if (sw.ref === ref) {
        updatedSwap = {
          ...sw,
          ...(status ? { status } : {}),
          ...(offer_cents !== undefined ? { offer_cents: Number(offer_cents) } : {}),
          ...(gap_cents !== undefined ? { gap_cents: Number(gap_cents) } : {}),
          ...(admin_note !== undefined ? { admin_note } : {}),
          ...(notes !== undefined ? { notes } : {}),
          updated_at: Date.now(),
        }
        return updatedSwap
      }
      return sw
    })
    saveFileDb(db)

    // 2. Mirror to MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        const updateFields: any = {}
        if (status) updateFields.status = status
        if (offer_cents !== undefined) updateFields.offerCents = Number(offer_cents)
        if (gap_cents !== undefined) updateFields.gapCents = Number(gap_cents)
        if (admin_note !== undefined) updateFields.adminNote = admin_note
        if (notes !== undefined) updateFields.notes = notes

        await Swap.findOneAndUpdate({ ref }, { $set: updateFields }, { new: true })
      }
    } catch (dbErr) {
      console.warn('MongoDB swap patch deferred:', dbErr)
    }

    if (!updatedSwap) {
      return NextResponse.json({ error: 'Swap not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      swap: mapSwapDoc(updatedSwap),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
