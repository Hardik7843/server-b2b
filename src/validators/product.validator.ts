import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Name is Required" : "Name must be String",
    })
    .min(1, "Name is required")
    .trim()
    .regex(/^[A-Za-z].*$/, "Name must start with a letter"),

  description: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^[A-Za-z0-9].*$/.test(val),
      "Description must start with a letter or number"
    ),

  price: z.number().min(0, "Price must not be negative").optional(),

  originalPrice: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Original Price is Required"
          : "Original Price is Required",
    })
    .min(0, "Original price must not be negative"),

  images: z.array(z.string()).default([]).optional(),

  tags: z.array(z.string()).default([]).optional(),

  active: z.boolean().default(false),

  stock: z
    .number()
    .int("Stock should be integer")
    .min(0, "Stock cannot be negative")
    .default(0),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
