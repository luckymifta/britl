import { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/Auth/LogoutButton";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin dashboard overview",
};

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-dark-4 dark:text-dark-6 mt-2">
            Welcome to your admin dashboard. Your session is protected until midnight.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* News Management */}
        <Link href="/admin/news" className="group">
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-dark transition-all group-hover:scale-105">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-dark dark:text-white">
              News & Announcements
            </h3>
            <p className="text-dark-4 dark:text-dark-6">
              Manage news articles and announcements
            </p>
          </div>
        </Link>

        {/* Products Management */}
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-dark">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-dark dark:text-white">
            Products
          </h3>
          <p className="text-dark-4 dark:text-dark-6">
            Manage product catalog and information
          </p>
        </div>

        {/* Services Management */}
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-dark">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-dark dark:text-white">
            Services
          </h3>
          <p className="text-dark-4 dark:text-dark-6">
            Manage company services and offerings
          </p>
        </div>

        {/* Team Management */}
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-dark">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-dark dark:text-white">
            Team
          </h3>
          <p className="text-dark-4 dark:text-dark-6">
            Manage team members and roles
          </p>
        </div>

        {/* Hero Banners */}
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-dark">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-dark dark:text-white">
            Hero Banners
          </h3>
          <p className="text-dark-4 dark:text-dark-6">
            Manage homepage hero banners and images
          </p>
        </div>

        {/* Company Info */}
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-dark">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-dark dark:text-white">
            Company
          </h3>
          <p className="text-dark-4 dark:text-dark-6">
            Manage company information and settings
          </p>
        </div>
      </div>

      {/* Session Info */}
      <div className="mt-8 rounded-lg bg-primary/5 border border-primary/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-dark dark:text-white">
              Secure Session Active
            </h4>
            <p className="text-sm text-dark-4 dark:text-dark-6">
              Your session will automatically expire at midnight for security. You can close and reopen your browser - you'll stay logged in until midnight.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
