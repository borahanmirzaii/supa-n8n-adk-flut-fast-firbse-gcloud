"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { logger } from "@/lib/logger";
import posthog from "posthog-js";
import { env } from "@/lib/env";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that initializes Firebase auth state listener
 * and tracks auth events with PostHog analytics
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    logger.info("AuthProvider: initializing auth state listener");
    const unsubscribe = initialize();

    return () => {
      logger.info("AuthProvider: cleaning up auth state listener");
      unsubscribe();
    };
  }, [initialize]);

  // Track auth events with PostHog
  useEffect(() => {
    if (typeof window === "undefined" || !env.NEXT_PUBLIC_POSTHOG_KEY) {
      return;
    }

    if (user) {
      posthog.identify(user.uid, {
        email: user.email,
        displayName: user.displayName,
      });
      posthog.capture("user_logged_in", {
        uid: user.uid,
        email: user.email,
      });
      logger.info({ uid: user.uid }, "PostHog: user identified");
    } else {
      posthog.reset();
      logger.info("PostHog: user reset");
    }
  }, [user]);

  return <>{children}</>;
}

