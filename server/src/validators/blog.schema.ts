import { z } from 'zod';

const blogStatusEnum = z.enum(['draft', 'published', 'archived']);
export const createBlogSchema = z.object({
  body: z.object({
    title: z
      .string({ error: 'Title is required' })
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title cannot exceed 200 characters'),

    excerpt: z
      .string({ error: 'Excerpt is required' })
      .min(10, 'Excerpt must be at least 10 characters')
      .max(500, 'Excerpt cannot exceed 500 characters'),

    content: z
      .string({ error: 'Content is required' })
      .min(50, 'Content must be at least 50 characters'),

    category: z
      .string({ error: 'Category is required' })
      .min(2, 'Category must be at least 2 characters'),

    tags: z
      .union([
        z.array(z.string()),
        z.string().transform((val) => JSON.parse(val)),
      ])
      .optional()
      .default([]),

    status: blogStatusEnum.optional().default('draft'),

    isFeatured: z
      .union([z.boolean(), z.string().transform((v) => v === 'true')])
      .optional()
      .default(false),

    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
  }),
});

export const updateBlogSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    excerpt: z.string().min(10).max(500).optional(),
    content: z.string().min(50).optional(),
    category: z.string().min(2).optional(),

    tags: z
      .union([z.array(z.string()), z.string().transform((val) => JSON.parse(val))])
      .optional(),

    status: blogStatusEnum.optional(),

    isFeatured: z
      .union([z.boolean(), z.string().transform((v) => v === 'true')])
      .optional(),

    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
  }),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>['body'];
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>['body'];