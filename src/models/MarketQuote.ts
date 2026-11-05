import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMarketQuote {
  _id?: mongoose.Types.ObjectId
  symbol: string // "TSLA" | "SPCX" | "X"
  name: string
  label: string
  price: number // in dollars
  change: number
  changePct: number
  currency: string
  marked: boolean
  updatedAt: Date
}

const MarketQuoteSchema = new Schema<IMarketQuote>(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
      trim: true,
    },
    name: { type: String, required: true },
    label: { type: String, required: true },
    price: { type: Number, required: true },
    change: { type: Number, default: 0 },
    changePct: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    marked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

export const MarketQuote: Model<IMarketQuote> =
  mongoose.models.MarketQuote || mongoose.model<IMarketQuote>('MarketQuote', MarketQuoteSchema)
export default MarketQuote
