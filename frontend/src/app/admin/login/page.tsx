import { Metadata } from "next";
import AdminLoginForm from "./_components/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login - Dashboard",
  description: "Admin login page for dashboard access",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-1 dark:bg-gray-dark">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-stroke bg-white p-8 shadow-lg dark:border-dark-3 dark:bg-gray-dark">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-dark dark:text-white">
                Admin Login
              </h1>
              <p className="text-dark-4 dark:text-dark-6">
                Sign in to access the admin dashboard
              </p>
            </div>
            
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
