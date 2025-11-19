"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import posthog from "posthog-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && env.NEXT_PUBLIC_POSTHOG_KEY) {
      try {
        posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
          api_host: env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
          capture_pageview: false,
          loaded: (posthog) => {
            logger.info("PostHog initialized");
          },
        });
      } catch (error) {
        logger.error({ error }, "Failed to initialize PostHog");
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

