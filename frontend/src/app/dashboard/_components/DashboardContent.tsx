"use client";

import { useAuth } from "@/components/Auth/AuthProvider";

export default function DashboardContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Welcome Header */}
      <div className="mb-8 rounded-xl border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white">
              Welcome back, {user?.full_name || 'Admin'}!
            </h1>
            <p className="text-dark-4 dark:text-dark-6">
              Role: {user?.role || 'User'} | Email: {user?.email}
            </p>
          </div>
          <div className="rounded-lg bg-primary/10 px-4 py-2">
            <span className="text-sm font-medium text-primary">
              {user?.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-xl border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-dark-4 dark:text-dark-6">Total Users</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">1,234</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-dark-4 dark:text-dark-6">Hero Banners</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">12</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-dark-4 dark:text-dark-6">Products</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">456</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-dark-4 dark:text-dark-6">Active Sessions</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">89</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark">
        <h2 className="mb-4 text-xl font-semibold text-dark dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <a
            href="/hero-banners"
            className="rounded-lg border border-stroke p-4 text-center transition hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
          >
            <div className="mb-2 text-2xl">🎨</div>
            <h3 className="font-medium text-dark dark:text-white">Manage Hero Banners</h3>
          </a>
          
          <a
            href="/products"
            className="rounded-lg border border-stroke p-4 text-center transition hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
          >
            <div className="mb-2 text-2xl">📦</div>
            <h3 className="font-medium text-dark dark:text-white">Manage Products</h3>
          </a>
          
          <a
            href="/profile"
            className="rounded-lg border border-stroke p-4 text-center transition hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
          >
            <div className="mb-2 text-2xl">👤</div>
            <h3 className="font-medium text-dark dark:text-white">Profile Settings</h3>
          </a>
          
          <a
            href="/settings"
            className="rounded-lg border border-stroke p-4 text-center transition hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
          >
            <div className="mb-2 text-2xl">⚙️</div>
            <h3 className="font-medium text-dark dark:text-white">System Settings</h3>
          </a>
        </div>
      </div>
    </div>
  );
}
