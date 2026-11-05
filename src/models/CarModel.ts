import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICarSpec {
  label: string
  value: string
}

export interface ICarModel {
  _id?: mongoose.Types.ObjectId
  slug: string
  name: string
  era: string
  body: 'sedan' | 'suv' | 'truck' | 'roadster' | 'semi'
  bodyLabel?: string
  tagline: string
  blurb: string
  swapValue: number // in cents e.g. 2900000 = $29,000
  listPrice: number // in cents e.g. 3899000 = $38,990
  specs: ICarSpec[]
  color: string
  photo?: string
  badge?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const CarSpecSchema = new Schema<ICarSpec>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
)

const CarModelSchema = new Schema<ICarModel>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    era: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      enum: ['sedan', 'suv', 'truck', 'roadster', 'semi'],
      required: true,
    },
    bodyLabel: {
      type: String,
    },
    tagline: {
      type: String,
      required: true,
    },
    blurb: {
      type: String,
      required: true,
    },
    swapValue: {
      type: Number,
      required: true,
    },
    listPrice: {
      type: Number,
      required: true,
    },
    specs: [CarSpecSchema],
    color: {
      type: String,
      default: '#a0a5ad',
    },
    photo: {
      type: String,
    },
    badge: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

export const CarModel: Model<ICarModel> =
  mongoose.models.CarModel || mongoose.model<ICarModel>('CarModel', CarModelSchema)
export default CarModel
