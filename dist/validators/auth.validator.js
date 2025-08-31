"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSchema = exports.signinSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    firstName: zod_1.z
        .string()
        .min(1, "First name is required")
        .max(50, "First name must be less than 50 characters")
        .trim(),
    lastName: zod_1.z
        .string()
        .max(50, "Last name must be less than 50 characters")
        .trim()
        .optional(),
    email: zod_1.z
        .email("Invalid email format")
        .trim()
        .min(1, "Email is required")
        .max(255, "Email must be less than 255 characters")
        .toLowerCase(),
    password: zod_1.z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must be less than 100 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    phoneNumber: zod_1.z
        .string()
        .trim()
        .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format")
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be less than 15 digits")
        .optional(),
});
exports.signinSchema = zod_1.z.object({
    email: zod_1.z
        .email("Invalid email format")
        .trim()
        .min(1, "Email is required")
        .toLowerCase(),
    password: zod_1.z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must be less than 100 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
});
exports.logoutSchema = zod_1.z.object({
    token: zod_1.z.string().trim().min(1, "Token is required"),
});
