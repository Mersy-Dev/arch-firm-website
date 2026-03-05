import { Document, Types } from 'mongoose';

export interface IUser extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
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