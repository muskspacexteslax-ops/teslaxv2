import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAnnouncement {
  _id?: mongoose.Types.ObjectId
  title: string
  body: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
)

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema)
export default Announcement
