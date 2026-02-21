import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { CONSTANTS } from '../config/constants';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'editor';
  refreshToken?: string;
  lastLogin?: Date;
  isActive: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['superadmin', 'admin', 'editor'], default: 'admin' },
  refreshToken: { type: String, select: false },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
// ✅ Fix - async without next
userSchema.pre('save', async function () {
  const doc = this as any;
  if (!doc.isModified('password')) return;
  doc.password = await bcrypt.hash(doc.password, CONSTANTS.BCRYPT_SALT_ROUNDS);
});

// Instance method to compare password on login
userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', userSchema);