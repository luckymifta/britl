"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Routes that should not have the main layout (sidebar + header)
  const publicRoutes = ["/admin/login", "/admin/register"];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    // Return children without layout for public routes
    return <>{children}</>;
  }

  // Return children with full layout for authenticated routes
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
        <Header />

        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
