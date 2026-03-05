import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  projectType?: 'residential' | 'commercial' | 'other';
  budget?: string;
  message: string;
  isRead: boolean;
  ipAddress?: string;
  createdAt: Date;
}

const contactSchema = new Schema<IContact>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, trim: true },
  projectType: { type: String, enum: ['residential', 'commercial', 'other'] },
  budget: { type: String },
  message: { type: String, required: true, maxlength: 2000 },
  isRead: { type: Boolean, default: false, index: true },
  ipAddress: { type: String },
}, { timestamps: true });

export default mongoose.model<IContact>('Contact', contactSchema);