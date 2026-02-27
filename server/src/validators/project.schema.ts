import { z } from 'zod';
import { CONSTANTS } from '../config/constants';

// ─── Reusable sub-schemas ──────────────────────────────────────────────────

const imageSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  publicId: z.string().min(1, 'Public ID required'),
  caption: z.string().optional(),
});

const seoSchema = z.object({
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  ogImage: z.string().url().optional().or(z.literal('')),
});

// ─── Create ────────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title is required').max(150),
    type: z.enum(CONSTANTS.PROJECT_TYPES, { error: 'Invalid project type' }),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    clientBrief: z.string().optional(),
    approach: z.string().optional(),
    location: z.string().min(2, 'Location is required'),
    area: z.number().positive().optional(),
    completedAt: z.string().refine((v) => !isNaN(Date.parse(v)), {
      message: 'Must be a valid date',
    }),
    // coverImage is handled via file upload — validated separately
    materials: z.array(z.string().trim()).default([]),
    services: z.array(z.string().trim()).default([]),
    featured: z.boolean().default(false),
    published: z.boolean().default(false),
    sortOrder: z.number().int().default(0),
    seo: seoSchema.optional(),
    coverImage: imageSchema.optional(), // ← add this
    images: z.array(imageSchema).default([]), // ← add this
  }),
});

// ─── Update (all fields optional except nothing required) ─────────────────

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(2).max(150).optional(),
    type: z.enum(CONSTANTS.PROJECT_TYPES).optional(),
    description: z.string().min(10).optional(),
    clientBrief: z.string().optional(),
    approach: z.string().optional(),
    location: z.string().min(2).optional(),
    area: z.number().positive().optional(),
    completedAt: z
      .string()
      .refine((v) => !isNaN(Date.parse(v)))
      .optional(),
    coverImage: imageSchema.optional(),
    images: z.array(imageSchema).optional(),
    materials: z.array(z.string().trim()).optional(),
    services: z.array(z.string().trim()).optional(),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    seo: seoSchema.optional(),
  }),
});

// ─── List / filter query params ────────────────────────────────────────────

export const projectQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.enum(CONSTANTS.PROJECT_TYPES).optional(),
    published: z.string().optional(), // 'true' | 'false'
    featured: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'completedAt', 'sortOrder', 'title']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
export type ProjectQuery = z.infer<typeof projectQuerySchema>['query'];
