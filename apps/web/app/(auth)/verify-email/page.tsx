"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { logger } from "@/lib/logger";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";

export default function VerifyEmailPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleResend = async () => {
    if (!user) return;

    try {
      setIsSending(true);
      logger.info({ uid: user.uid }, "VerifyEmailPage: resending verification email");
      await verifyEmail();
      toast.success("Verification email sent! Check your inbox.");
      logger.info({ uid: user.uid }, "VerifyEmailPage: verification email sent");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send verification email";
      toast.error(errorMessage);
      logger.error({ error, uid: user?.uid }, "VerifyEmailPage: failed to send verification");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isEmailVerified = user.emailVerified;

  if (isEmailVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="rounded-lg bg-white px-8 py-10 shadow-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Email Verified</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your email has been verified successfully.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-lg bg-white px-8 py-10 shadow-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Verify your email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a verification email to <strong>{user.email}</strong>
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Please check your inbox and click the verification link.
        </p>

        <div className="mt-6 space-y-4">
          <button
            onClick={handleResend}
            disabled={isSending}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Resend verification email"}
          </button>

          <Link
            href="/"
            className="block text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Skip for now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

