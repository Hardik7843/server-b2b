"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z
        .string({
        error: (issue) => issue.input === undefined ? "Name is Required" : "Name must be String",
    })
        .min(1, "Name is required")
        .trim()
        .regex(/^[A-Za-z].*$/, "Name must start with a letter"),
    description: zod_1.z
        .string()
        .trim()
        .optional()
        .refine((val) => !val || /^[A-Za-z0-9].*$/.test(val), "Description must start with a letter or number"),
    price: zod_1.z.number().min(0, "Price must not be negative").optional(),
    originalPrice: zod_1.z
        .number({
        error: (issue) => issue.input === undefined
            ? "Original Price is Required"
            : "Original Price is Required",
    })
        .min(0, "Original price must not be negative"),
    images: zod_1.z.array(zod_1.z.string()).default([]).optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]).optional(),
    // active: z.boolean().default(false),
    stock: zod_1.z
        .number()
        .int("Stock should be integer")
        .min(0, "Stock cannot be negative")
        .default(0),
});
