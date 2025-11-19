import { z } from "zod";

/**
 * User validation schemas matching Pydantic models on backend
 */

export const userRoleSchema = z.enum(["user", "admin", "moderator"]);

export const userSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  role: userRoleSchema.default("user"),
  emailVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.unknown()).optional(),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  language: z.string().default("en"),
});

export const userProfileSchema = userSchema.extend({
  bio: z.string().max(500).optional(),
  preferences: userPreferencesSchema.optional(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100).optional(),
  photoURL: z.string().url().optional(),
  role: userRoleSchema.optional(),
});

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  photoURL: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  preferences: userPreferencesSchema.partial().optional(),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

