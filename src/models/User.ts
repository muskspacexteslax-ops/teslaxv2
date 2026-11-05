import mongoose, { Schema, Model, Types } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser {
  _id?: Types.ObjectId
  email: string
  passwordHash?: string
  fullName: string
  phone?: string
  country?: string
  role: 'member' | 'admin'
  status: 'active' | 'suspended' | 'unverified'
  emailVerified: boolean
  verificationCode?: string
  balanceCents: number
  addressLine1?: string
  city?: string
  referralCode?: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      select: false, // Don't return password by default
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      default: 'United States',
      trim: true,
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'unverified'],
      default: 'active',
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    verificationCode: {
      type: String,
    },
    balanceCents: {
      type: Number,
      default: 0,
    },
    addressLine1: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
)

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false
  return bcrypt.compare(candidatePassword, this.passwordHash)
}

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
