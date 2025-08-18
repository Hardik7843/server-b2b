import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Name is Required" : "Name must be String",
    })
    .min(1, "Name is required")
    .regex(/^[A-Za-z].*$/, "Name must start with a letter"),

  description: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Za-z0-9].*$/.test(val),
      "Description must start with a letter or number"
    ),

  price: z.number().min(0, "Price must not be negative"),

  originalPrice: z.number().min(0, "Original price must not be negative"),

  images: z.array(z.string()).default([]).optional(),

  tags: z.array(z.string()).default([]).optional(),

  active: z.boolean().default(false),

  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
