/**
 * User types with role-based access control
 */

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  MODERATOR = "moderator",
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface UserProfile extends User {
  bio?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
}

export interface UserCreateInput {
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: UserRole;
}

export interface UserUpdateInput {
  displayName?: string;
  photoURL?: string;
  bio?: string;
  preferences?: Partial<UserPreferences>;
}

