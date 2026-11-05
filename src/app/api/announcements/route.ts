import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '../../../lib/mongodb'
import { Announcement } from '../../../models'
import { getFileDb, saveFileDb } from '../../../lib/file-store'

function mapAnnouncementDoc(a: any) {
  return {
    id: a._id?.toString() || a.id,
    title: a.title,
    body: a.body,
    active: a.active ? 1 : 0,
    created_at: typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : a.created_at || Date.now(),
  }
}

export async function GET() {
  try {
    const conn = await connectToDatabase()
    if (conn) {
      const docs = await Announcement.find().sort({ createdAt: -1 })
      if (docs.length > 0) return NextResponse.json({ announcements: docs.map(mapAnnouncementDoc) })
    }
  } catch (err) {
    // Fall through to file store
  }

  const db = getFileDb()
  return NextResponse.json({ announcements: db.announcements.map(mapAnnouncementDoc) })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, body: text } = body

    const requester = req.headers.get('x-requester-email') || body.requesterEmail
    if (requester?.toLowerCase() !== 'muskspacex.teslax@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized: Admin privilege required' }, { status: 403 })
    }

    if (!title || !text) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
    }

    // 1. Save to file store
    const db = getFileDb()
    const newAnn = {
      id: Date.now(),
      title,
      body: text,
      active: 1,
      created_at: Date.now(),
    }
    db.announcements.unshift(newAnn)
    saveFileDb(db)

    // 2. Mirror to MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        await Announcement.create({
          title,
          body: text,
          active: true,
        })
      }
    } catch (dbErr) {
      console.warn('MongoDB announcement mirror deferred:', dbErr)
    }

    return NextResponse.json({
      success: true,
      announcement: mapAnnouncementDoc(newAnn),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id } = body

    const requester = req.headers.get('x-requester-email') || body.requesterEmail
    if (requester?.toLowerCase() !== 'muskspacex.teslax@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized: Admin privilege required' }, { status: 403 })
    }

    // 1. Update in file store
    const db = getFileDb()
    let updated: any = null
    db.announcements = db.announcements.map((a: any) => {
      if (String(a.id) === String(id)) {
        updated = { ...a, active: a.active ? 0 : 1 }
        return updated
      }
      return a
    })
    saveFileDb(db)

    // 2. Mirror to MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn && id && String(id).length === 24) {
        const doc = await Announcement.findById(id)
        if (doc) {
          doc.active = !doc.active
          await doc.save()
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB announcement patch deferred:', dbErr)
    }

    return NextResponse.json({ success: true, announcement: updated ? mapAnnouncementDoc(updated) : null })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Missing announcement id' }, { status: 400 })

    // 1. Delete from file store
    const db = getFileDb()
    db.announcements = db.announcements.filter((a: any) => String(a.id) !== String(id))
    saveFileDb(db)

    // 2. Mirror to MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn && id.length === 24) {
        await Announcement.findByIdAndDelete(id)
      }
    } catch (dbErr) {
      console.warn('MongoDB announcement delete deferred:', dbErr)
    }

    return NextResponse.json({ success: true, id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
