"use client";

import { useAuth } from "@/components/Auth/AuthProvider";
import { useState } from "react";

export function LogoutButton() {
  const { logout, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {user && (
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-dark dark:text-white">
            {user.full_name}
          </p>
          <p className="text-xs text-dark-4 dark:text-dark-6">
            {user.email}
          </p>
        </div>
      )}
      
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        )}
        {isLoading ? "Signing out..." : "Logout"}
      </button>
    </div>
  );
}
