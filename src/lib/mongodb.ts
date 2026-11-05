import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teslax'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

/**
 * Global is used here to maintain a cached connection across hot-reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage in Next.js.
 */
interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
  failedAt?: number
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (cached!.conn) {
    return cached!.conn
  }

  // If previous connection failed recently, avoid stalling requests
  if (cached!.failedAt && Date.now() - cached!.failedAt < 30000) {
    return null
  }

  if (!cached!.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    }

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully')
      cached!.failedAt = undefined
      return mongooseInstance
    })
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    cached!.failedAt = Date.now()
    return null
  }

  return cached!.conn
}

export default connectToDatabase

