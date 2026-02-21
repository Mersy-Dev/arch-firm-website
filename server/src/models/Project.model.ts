import mongoose, { Schema, Document, Model } from 'mongoose';
import { NextFunction } from 'express';
import slugifyLib from 'slugify';
import { CONSTANTS } from '../config/constants';

export interface IProject extends Document {
  title: string;
  slug: string;
  type: typeof CONSTANTS.PROJECT_TYPES[number];
  description: string;
  clientBrief?: string;
  approach?: string;
  location: string;
  area?: number;
  completedAt: Date;
  coverImage: { url: string; publicId: string };
  images: { url: string; publicId: string; caption?: string }[];
  materials: string[];
  services: string[];
  featured: boolean;
  published: boolean;
  sortOrder: number;
  seo: { metaTitle?: string; metaDescription?: string; ogImage?: string };
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, unique: true, lowercase: true, index: true },
    type: { type: String, enum: CONSTANTS.PROJECT_TYPES, required: true },
    description: { type: String, required: true },
    clientBrief: { type: String },
    approach: { type: String },
    location: { type: String, required: true },
    area: { type: Number },
    completedAt: { type: Date, required: true },
    coverImage: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    images: [{
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      caption: { type: String },
    }],
    materials: [{ type: String, trim: true }],
    services: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0 },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      ogImage: { type: String },
    },
  },
  { timestamps: true }
);

// Auto-generate slug from title before saving
projectSchema.pre<IProject>('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugifyLib(this.title, { lower: true, strict: true });
  }
  next();
});

// Text search index for search functionality
projectSchema.index({ title: 'text', description: 'text', location: 'text' });

const Project: Model<IProject> = mongoose.model('Project', projectSchema);
export default Project;