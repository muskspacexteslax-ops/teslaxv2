import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface ISwapEvent {
  kind: string
  note: string
  createdAt: Date
}

export interface ISwap {
  _id?: Types.ObjectId
  ref: string // e.g. "TX-8921"
  userId: Types.ObjectId
  // Submitted vehicle
  make: string
  model: string
  year: number
  mileage: number
  fuel: string // "petrol" | "diesel" | "hybrid" | "electric"
  transmission: string // "automatic" | "manual"
  condition: string // "pristine" | "excellent" | "good" | "fair"
  owners?: number
  serviceHistory?: string // "full" | "partial" | "none"
  accidentHistory?: string // "none" | "minor" | "repaired"

  // Selected target Tesla
  targetSlug: string
  targetName: string

  // Valuation numbers (in cents)
  estimateLow: number
  estimateMid: number
  estimateHigh: number
  offerCents: number
  gapCents: number
  months?: number
  monthlyCents?: number

  // Media & Notes
  photoToken?: string
  photos: string[]
  notes?: string
  adminNote?: string

  // Status
  status: 'draft' | 'submitted' | 'valued' | 'accepted' | 'scheduled' | 'in_transit' | 'completed' | 'declined'

  // Audit history
  events: ISwapEvent[]

  createdAt: Date
  updatedAt: Date
}

const SwapEventSchema = new Schema<ISwapEvent>(
  {
    kind: { type: String, required: true },
    note: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const SwapSchema = new Schema<ISwap>(
  {
    ref: {
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
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    mileage: { type: Number, required: true },
    fuel: { type: String, default: 'petrol' },
    transmission: { type: String, default: 'automatic' },
    condition: { type: String, default: 'good' },
    owners: { type: Number, default: 1 },
    serviceHistory: { type: String, default: 'full' },
    accidentHistory: { type: String, default: 'none' },

    targetSlug: { type: String, required: true },
    targetName: { type: String, required: true },

    estimateLow: { type: Number, required: true },
    estimateMid: { type: Number, required: true },
    estimateHigh: { type: Number, required: true },
    offerCents: { type: Number, default: 0 },
    gapCents: { type: Number, default: 0 },
    months: { type: Number, default: 36 },
    monthlyCents: { type: Number, default: 0 },

    photoToken: { type: String },
    photos: { type: [String], default: [] },
    notes: { type: String },
    adminNote: { type: String },

    status: {
      type: String,
      enum: ['draft', 'submitted', 'valued', 'accepted', 'scheduled', 'in_transit', 'completed', 'declined'],
      default: 'submitted',
      index: true,
    },

    events: [SwapEventSchema],
  },
  {
    timestamps: true,
  }
)

export const Swap: Model<ISwap> = mongoose.models.Swap || mongoose.model<ISwap>('Swap', SwapSchema)
export default Swap
