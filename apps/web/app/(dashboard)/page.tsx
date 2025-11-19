"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { logger } from "@/lib/logger";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      logger.info({ uid: user.uid }, "DashboardPage: user accessed dashboard");
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to log out");
      logger.error({ error }, "DashboardPage: logout failed");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AIP Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white px-6 py-8 shadow">
          <h2 className="text-2xl font-bold text-gray-900">Welcome to your Dashboard</h2>
          <p className="mt-2 text-gray-600">
            You're successfully authenticated! This is a protected route.
          </p>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">User Information</h3>
            <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.uid}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email Verified</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.emailVerified ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-red-600">
                      No{" "}
                      <a
                        href="/verify-email"
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Verify now
                      </a>
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}

