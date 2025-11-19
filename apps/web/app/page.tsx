"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    // Initialize auth state listener
    const { initialize } = useAuthStore.getState();
    initialize();
  }, []);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">AIP Monorepo</h1>
        <p className="text-lg text-muted-foreground mb-8">
          AI Agentic Development Platform
        </p>

        {user ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Welcome back, {user.email}!
            </p>
            <Link
              href="/dashboard"
              className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-x-4">
            <Link
              href="/login"
              className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-block rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

