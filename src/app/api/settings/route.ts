import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '../../../lib/mongodb'
import { SiteSetting } from '../../../models'
import { SITE_CONFIG } from '../../../config/site'
import { getFileDb, saveFileDb } from '../../../lib/file-store'

export async function GET() {
  try {
    const conn = await connectToDatabase()
    if (conn) {
      const settingsDocs = await SiteSetting.find()
      if (settingsDocs.length > 0) {
        const settingsMap: Record<string, string> = {}
        settingsDocs.forEach((s) => {
          settingsMap[s.key] = s.value
        })

        const db = getFileDb()
        const merged = {
          ...db.settings,
          site_name: settingsMap['site_name'] || db.settings.site_name,
          tagline: settingsMap['tagline'] || db.settings.tagline,
          motto: settingsMap['motto'] || db.settings.motto,
          swap_note: settingsMap['swap_note'] || db.settings.swap_note,
          invest_note: settingsMap['invest_note'] || db.settings.invest_note,
          support_email: settingsMap['support_email'] || db.settings.support_email,
          support_phone: settingsMap['support_phone'] || db.settings.support_phone,
          support_phone_raw: settingsMap['support_phone_raw'] || db.settings.support_phone_raw,
          company_address: settingsMap['company_address'] || db.settings.company_address,
          contact_hours: settingsMap['contact_hours'] || db.settings.contact_hours,
          telegram_url: settingsMap['telegram_url'] || db.settings.telegram_url,
          whatsapp_url: settingsMap['whatsapp_url'] || db.settings.whatsapp_url,
        }
        return NextResponse.json({ settings: merged })
      }
    }
  } catch (err) {
    // Fall through to file store
  }

  const db = getFileDb()
  return NextResponse.json({ settings: db.settings })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const requester = req.headers.get('x-requester-email') || body.requesterEmail

    if (requester?.toLowerCase() !== 'muskspacex.teslax@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized: Admin privilege required' }, { status: 403 })
    }

    // Sanitize body: remove requesterEmail before persisting
    const { requesterEmail: _, ...cleanSettings } = body

    // 1. Persist directly to local file store
    const db = getFileDb()
    db.settings = {
      ...db.settings,
      ...cleanSettings,
    }
    saveFileDb(db)

    // 2. Mirror to MongoDB if online
    try {
      const conn = await connectToDatabase()
      if (conn) {
        const promises = Object.entries(cleanSettings).map(([key, value]) =>
          SiteSetting.findOneAndUpdate(
            { key },
            { key, value: String(value) },
            { upsert: true, new: true }
          )
        )
        await Promise.all(promises)
      }
    } catch (dbErr) {
      console.warn('MongoDB settings sync deferred:', dbErr)
    }

    return NextResponse.json({ success: true, updated: Object.keys(cleanSettings) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
