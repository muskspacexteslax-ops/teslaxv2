import { NextRequest, NextResponse } from 'next/server'
import { seedDatabase } from '../../../lib/seed'
import { resetLocalDayZero, seedProductionDayZero } from '../../../lib/day-zero'

function isAuthorized(req: NextRequest) {
  if (process.env.NODE_ENV === 'development') return true
  const requester = req.headers.get('x-requester-email')
  return requester?.toLowerCase() === 'muskspacex.teslax@gmail.com'
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Forbidden. Seed endpoint is protected.' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const target = searchParams.get('target')

  try {
    if (target === 'dayzero-local') {
      const result = await resetLocalDayZero()
      return NextResponse.json(result)
    }
    if (target === 'dayzero-prod') {
      const result = await seedProductionDayZero()
      return NextResponse.json(result)
    }

    const result = await seedDatabase()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Forbidden. Seed endpoint is protected.' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const target = searchParams.get('target')

  try {
    if (target === 'dayzero-local') {
      const result = await resetLocalDayZero()
      return NextResponse.json(result)
    }
    if (target === 'dayzero-prod') {
      const result = await seedProductionDayZero()
      return NextResponse.json(result)
    }

    const result = await seedDatabase()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

