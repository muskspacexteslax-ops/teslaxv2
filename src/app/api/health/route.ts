import { NextResponse } from 'next/server'
import connectToDatabase from '../../../lib/mongodb'
import { User, CarModel, Swap } from '../../../models'

export async function GET() {
  try {
    await connectToDatabase()
    const [userCount, modelCount, swapCount] = await Promise.all([
      User.countDocuments(),
      CarModel.countDocuments(),
      Swap.countDocuments(),
    ])

    return NextResponse.json({
      status: 'healthy',
      database: 'MongoDB',
      connected: true,
      counts: {
        users: userCount,
        carModels: modelCount,
        swaps: swapCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'MongoDB',
        connected: false,
        error: error.message,
        hint: 'Verify MONGODB_URI in .env.local or ensure MongoDB is running.',
      },
      { status: 500 }
    )
  }
}

