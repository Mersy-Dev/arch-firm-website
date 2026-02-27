import { Document } from 'mongoose';

// Model interfaces live in their own model files (e.g. Project.model.ts).
// This file is reserved for shared/cross-cutting types.

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  role: 'admin' | 'superadmin';
  refreshToken?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}