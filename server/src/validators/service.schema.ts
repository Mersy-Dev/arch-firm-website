import { z } from "zod";

export const createServiceSchema = z.object({
  number: z.string().min(1, "Service number is required"),
  title: z.string().min(1, "Title is required"),
  tagline: z.string().min(1, "Tagline is required"),
  shortDesc: z.string().min(1, "Short description is required"),
  description: z.string().min(1, "Description is required"),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  deliverables: z.array(z.string()).min(1, "At least one deliverable is required"),
  image: z.string().url("Image must be a valid URL"),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
});

export const updateServiceSchema = createServiceSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;