import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IHolding {
  _id?: Types.ObjectId
  userId: Types.ObjectId
  symbol: string // "TSLA" | "SPCX" | "X"
  shares: number
  costBasisCents: number
  createdAt: Date
  updatedAt: Date
}

const HoldingSchema = new Schema<IHolding>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    shares: {
      type: Number,
      required: true,
      default: 0,
    },
    costBasisCents: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

HoldingSchema.index({ userId: 1, symbol: 1 }, { unique: true })

export const Holding: Model<IHolding> =
  mongoose.models.Holding || mongoose.model<IHolding>('Holding', HoldingSchema)
export default Holding
