import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { CONSTANTS } from '../config/constants';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'editor';
  refreshToken?: string;
  lastLogin?: Date;
  isActive: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['superadmin', 'editor'], default: 'editor' },
  refreshToken: { type: String, select: false },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next: any) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, CONSTANTS.BCRYPT_SALT_ROUNDS);
  next();
});

// Instance method to compare password on login
userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', userSchema);