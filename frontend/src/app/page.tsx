"use client";

import { useAuth } from "@/components/Auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/admin/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while redirecting
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-dark-4 dark:text-dark-6">Redirecting...</p>
      </div>
    </div>
  );
}
