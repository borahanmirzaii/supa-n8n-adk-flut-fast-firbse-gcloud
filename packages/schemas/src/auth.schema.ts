import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    displayName: z.string().min(1, "Display name is required").max(50).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// Password reset schema
export const passwordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

// Password update schema
export const passwordUpdateSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;

// Email verification schema
export const emailVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;

