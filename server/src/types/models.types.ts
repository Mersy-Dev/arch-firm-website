import { Document } from 'mongoose';

// ...your existing interfaces stay untouched
export interface IProject extends Document {
  // whatever you already have
}

export interface IBlogPost extends Document {
  // whatever you already have
}

// Add this new one at the bottom
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