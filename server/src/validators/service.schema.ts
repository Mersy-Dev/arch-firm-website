import { z } from "zod";

// Arrays sent via multipart/form-data arrive as JSON strings — accept both
const arrayField = z.union([
  z.array(z.string()).min(1),
  z.string().transform((s) => JSON.parse(s) as string[]),
]);

export const createServiceSchema = z.object({
  number:      z.string().min(1, "Service number is required"),
  title:       z.string().min(1, "Title is required"),
  tagline:     z.string().min(1, "Tagline is required"),
  shortDesc:   z.string().min(1, "Short description is required"),
  description: z.string().min(1, "Description is required"),
  features:    arrayField,
  deliverables:arrayField,
  // Optional in schema — controller enforces presence (may arrive as req.file)
  image:    z.string().optional(),
  isActive: z.union([z.boolean(), z.string().transform(v => v !== "false")])
              .optional().default(true),
  order:    z.union([z.number(), z.string().transform(Number)])
              .optional().default(0),
});

export const updateServiceSchema = createServiceSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;