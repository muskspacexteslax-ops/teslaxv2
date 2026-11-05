import mongoose, { Schema, Model, Types } from 'mongoose'

export interface IOtp {
  _id?: Types.ObjectId
  email: string
  code: string
  purpose: 'signup' | 'login' | 'verify' | 'reset'
  verified: boolean
  createdAt: Date
}

const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ['signup', 'login', 'verify', 'reset'],
      default: 'verify',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // Automatically expires and self-deletes from MongoDB after 10 minutes (600s)
      expires: 600,
    },
  },
  {
    timestamps: false,
  }
)

export const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema)
export default Otp

