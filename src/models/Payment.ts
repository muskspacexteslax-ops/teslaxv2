import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IPayment {
  _id?: Types.ObjectId
  reference: string // e.g. "TXP-4011"
  userId: Types.ObjectId
  swapId?: Types.ObjectId
  fullName?: string
  email?: string
  amountCents: number
  method: string // "card" | "bank transfer" | "wire"
  status: 'pending' | 'confirmed' | 'rejected' | 'failed'
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    swapId: {
      type: Schema.Types.ObjectId,
      ref: 'Swap',
    },
    fullName: { type: String, trim: true },
    email: { type: String, trim: true },
    amountCents: { type: Number, required: true },
    method: { type: String, default: 'bank transfer' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'failed'],
      default: 'pending',
      index: true,
    },
    reviewedAt: { type: Date },
  },
  {
    timestamps: true,
  }
)

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)
export default Payment
