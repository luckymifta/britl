import { AuthGuard } from "@/components/Auth/AuthGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin Dashboard - Timles",
    default: "Admin Dashboard - Timles",
  },
  description: "Admin dashboard for managing Timles content and settings",
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}
