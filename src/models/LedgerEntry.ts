import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface ILedgerEntry {
  _id?: Types.ObjectId
  userId: Types.ObjectId
  deltaCents: number
  reason: string
  createdAt: Date
}

const LedgerEntrySchema = new Schema<ILedgerEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deltaCents: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

export const LedgerEntry: Model<ILedgerEntry> =
  mongoose.models.LedgerEntry || mongoose.model<ILedgerEntry>('LedgerEntry', LedgerEntrySchema)
export default LedgerEntry
