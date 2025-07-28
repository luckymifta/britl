"use client";

import { useAuth } from "@/components/Auth/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = "/auth/sign-in" 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Store the attempted URL for redirect after login
        const returnUrl = pathname !== "/auth/sign-in" ? pathname : "/admin";
        router.push(`${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`);
      } else if (!requireAuth && isAuthenticated && pathname === "/auth/sign-in") {
        // User is already authenticated and trying to access login page
        router.push("/admin");
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router, pathname, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if auth requirement not met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Don't render login page if already authenticated
  if (!requireAuth && isAuthenticated && pathname === "/auth/sign-in") {
    return null;
  }

  return <>{children}</>;
}
