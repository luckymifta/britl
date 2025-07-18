"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/components/Auth/AuthProvider";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <AuthProvider>
        <SidebarProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
