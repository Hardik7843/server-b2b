import { z } from "zod";

export const signupSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .trim(),
  lastName: z
    .string()
    .max(50, "Last name must be less than 50 characters")
    .trim()
    .optional(),
  email: z
    .email("Invalid email format")
    .trim()
    .min(1, "Email is required")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase(),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .optional(),
});

export const signinSchema = z.object({
  email: z
    .email("Invalid email format")
    .trim()
    .min(1, "Email is required")
    .toLowerCase(),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const logoutSchema = z.object({
  token: z.string().trim().min(1, "Token is required"),
});
