"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import { useToast } from "@/components/ui/toast";
import { authService } from "@/services/auth.service";

export default function AdminLoginForm() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.email || !formData.password) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please fill in all fields",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Login with backend API
      await authService.login(formData.email, formData.password);
      
      // Get user data after successful login
      const userData = await authService.getCurrentUser();
      authService.setUserData(userData);

      showToast({
        type: "success",
        title: "Login Successful",
        message: `Welcome back, ${userData.full_name}!`,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      showToast({
        type: "error",
        title: "Login Failed",
        message: error instanceof Error ? error.message : "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-dark dark:text-white">
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-12 pr-4 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            placeholder="Enter your email"
          />
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <EmailIcon className="h-5 w-5 text-dark-5 dark:text-dark-6" />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-dark dark:text-white">
          Password
        </label>
        <div className="relative">
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-12 pr-4 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            placeholder="Enter your password"
          />
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <PasswordIcon className="h-5 w-5 text-dark-5 dark:text-dark-6" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary py-3 px-4 font-medium text-white transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
            Signing In...
          </span>
        ) : (
          "Sign In"
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-dark-4 dark:text-dark-6">
          Don't have an account?{" "}
          <a href="/admin/register" className="text-primary hover:underline">
            Contact Administrator
          </a>
        </p>
      </div>
    </form>
  );
}
