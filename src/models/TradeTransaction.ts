import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface ITradeTransaction {
  _id?: Types.ObjectId
  userId: Types.ObjectId
  symbol: string // "TSLA" | "SPCX" | "X"
  side: 'buy' | 'sell'
  shares: number
  priceCents: number
  totalCents: number
  createdAt: Date
}

const TradeTransactionSchema = new Schema<ITradeTransaction>(
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
      index: true,
    },
    side: {
      type: String,
      enum: ['buy', 'sell'],
      required: true,
    },
    shares: {
      type: Number,
      required: true,
    },
    priceCents: {
      type: Number,
      required: true,
    },
    totalCents: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

export const TradeTransaction: Model<ITradeTransaction> =
  mongoose.models.TradeTransaction || mongoose.model<ITradeTransaction>('TradeTransaction', TradeTransactionSchema)
export default TradeTransaction
