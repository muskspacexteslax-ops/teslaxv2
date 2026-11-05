import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISiteSetting {
  _id?: mongoose.Types.ObjectId
  key: string
  value: string
  updatedAt: Date
}

const SiteSettingSchema = new Schema<ISiteSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export const SiteSetting: Model<ISiteSetting> =
  mongoose.models.SiteSetting || mongoose.model<ISiteSetting>('SiteSetting', SiteSettingSchema)
export default SiteSetting
