"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "firebase/auth";
import {
  onAuthStateChange,
  loginWithEmail,
  registerWithEmail,
  sendPasswordReset,
  sendEmailVerification,
  signOutUser,
  updateUserPassword,
} from "../firebase/client";
import { logger } from "../logger";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      error: null,

      setUser: (user) => {
        set({ user, error: null });
        logger.info({ uid: user?.uid }, "Auth store: user updated");
      },

      setIsLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
        if (error) {
          logger.error({ error }, "Auth store: error set");
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const user = await loginWithEmail(email, password);
          set({ user, isLoading: false, error: null });
          logger.info({ uid: user.uid }, "Auth store: login successful");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Login failed";
          set({ user: null, isLoading: false, error: errorMessage });
          logger.error({ error }, "Auth store: login failed");
          throw error;
        }
      },

      register: async (email: string, password: string, displayName?: string) => {
        try {
          set({ isLoading: true, error: null });
          const user = await registerWithEmail(email, password, displayName);
          set({ user, isLoading: false, error: null });
          logger.info({ uid: user.uid }, "Auth store: registration successful");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Registration failed";
          set({ user: null, isLoading: false, error: errorMessage });
          logger.error({ error }, "Auth store: registration failed");
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          await signOutUser();
          set({ user: null, isLoading: false, error: null });
          logger.info("Auth store: logout successful");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Logout failed";
          set({ isLoading: false, error: errorMessage });
          logger.error({ error }, "Auth store: logout failed");
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          await sendPasswordReset(email);
          set({ isLoading: false, error: null });
          logger.info({ email }, "Auth store: password reset sent");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Password reset failed";
          set({ isLoading: false, error: errorMessage });
          logger.error({ error }, "Auth store: password reset failed");
          throw error;
        }
      },

      verifyEmail: async () => {
        const { user } = get();
        if (!user) {
          throw new Error("No user logged in");
        }

        try {
          set({ isLoading: true, error: null });
          await sendEmailVerification(user);
          set({ isLoading: false, error: null });
          logger.info({ uid: user.uid }, "Auth store: email verification sent");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Email verification failed";
          set({ isLoading: false, error: errorMessage });
          logger.error({ error }, "Auth store: email verification failed");
          throw error;
        }
      },

      updatePassword: async (currentPassword: string, newPassword: string) => {
        const { user } = get();
        if (!user) {
          throw new Error("No user logged in");
        }

        try {
          set({ isLoading: true, error: null });
          await updateUserPassword(user, currentPassword, newPassword);
          set({ isLoading: false, error: null });
          logger.info({ uid: user.uid }, "Auth store: password updated");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Password update failed";
          set({ isLoading: false, error: errorMessage });
          logger.error({ error }, "Auth store: password update failed");
          throw error;
        }
      },

      initialize: () => {
        set({ isLoading: true });
        logger.info("Auth store: initializing");

        const unsubscribe = onAuthStateChange((user) => {
          set({ user, isLoading: false });
          logger.info({ uid: user?.uid }, "Auth store: initialized");
        });

        return unsubscribe;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        // Don't persist loading/error states
      }),
    }
  )
);
