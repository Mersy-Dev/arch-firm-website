import mongoose, { Document, Schema } from "mongoose";
import slugify from "slugify";

export interface IService extends Document {
  number: string;
  title: string;
  tagline: string;
  shortDesc: string;
  description: string;
  features: string[];
  deliverables: string[];
  image: string;
  slug: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    number: {
      type: String,
      required: [true, "Service number is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    tagline: {
      type: String,
      required: [true, "Tagline is required"],
      trim: true,
    },
    shortDesc: {
      type: String,
      required: [true, "Short description is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    features: {
      type: [String],
      default: [],
    },
    deliverables: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ── Auto-generate slug — async pattern (no `next`, no type conflicts) ──────
ServiceSchema.pre("save", async function () {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});

export default mongoose.model<IService>("Service", ServiceSchema);