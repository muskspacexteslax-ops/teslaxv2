import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '../../../lib/mongodb'
import { CarModel } from '../../../models'
import { MODELS } from '../../../data/models'
import { getFileDb, saveFileDb } from '../../../lib/file-store'

export async function GET() {
  try {
    const conn = await connectToDatabase()
    if (conn) {
      let docs = await CarModel.find({ active: true }).sort({ swapValue: 1 })
      if (docs.length > 0) {
        const mapped = docs.map((d: any) => ({
          id: d._id?.toString() || d.slug,
          slug: d.slug,
          name: d.name,
          era: d.era,
          body: d.body,
          bodyLabel: d.bodyLabel,
          tagline: d.tagline,
          blurb: d.blurb,
          swap_value: d.swapValue ?? d.swap_value,
          list_price: d.listPrice ?? d.list_price,
          specs: d.specs || [],
          specs_json: JSON.stringify(d.specs || []),
          color: d.color,
          photo: d.photo,
          badge: d.badge,
        }))
        return NextResponse.json({ models: mapped })
      }
    }
  } catch (err) {
    // Fall through to file store
  }

  // Persistent file store fallback (guaranteed disk persistence)
  const db = getFileDb()
  return NextResponse.json({ models: db.models || MODELS })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, swap_value } = body

    const requester = req.headers.get('x-requester-email') || body.requesterEmail
    if (requester?.toLowerCase() !== 'muskspacex.teslax@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized: Admin privilege required' }, { status: 403 })
    }

    if (!slug || swap_value === undefined) {
      return NextResponse.json({ error: 'Missing slug or swap_value' }, { status: 400 })
    }

    const swapValNumber = Number(swap_value)

    // 1. Persist directly to local file store
    const db = getFileDb()
    let found = false
    db.models = db.models.map((m: any) => {
      if (m.slug === slug) {
        found = true
        return { ...m, swap_value: swapValNumber }
      }
      return m
    })
    if (!found) {
      const staticModel = MODELS.find((m) => m.slug === slug)
      if (staticModel) {
        db.models.push({ ...staticModel, swap_value: swapValNumber })
      }
    }
    saveFileDb(db)

    // 2. Mirror to MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        const staticModel = MODELS.find((m) => m.slug === slug)
        await CarModel.findOneAndUpdate(
          { slug },
          {
            $set: {
              swapValue: swapValNumber,
              ...(staticModel
                ? {
                    name: staticModel.name,
                    era: staticModel.era,
                    body: staticModel.body,
                    tagline: staticModel.tagline,
                    blurb: staticModel.blurb,
                    listPrice: staticModel.list_price,
                    color: staticModel.color,
                    photo: staticModel.photo,
                    badge: staticModel.badge,
                    active: true,
                  }
                : {}),
            },
          },
          { upsert: true, new: true }
        )
      }
    } catch (dbErr) {
      console.warn('MongoDB sync deferred:', dbErr)
    }

    return NextResponse.json({
      success: true,
      model: {
        slug,
        swap_value: swapValNumber,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
