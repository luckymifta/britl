"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService, type User } from "@/lib/api/auth";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ["/admin/login", "/admin/register"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to get user data from localStorage first
          const storedUser = authService.getUserData();
          if (storedUser) {
            setUser(storedUser);
            setIsLoading(false);
            
            // If user is on login page and authenticated, redirect to dashboard
            if (pathname === "/admin/login") {
              router.push("/dashboard");
              return;
            }
            
            // Optionally refresh user data from API in background
            try {
              const freshUser = await authService.getCurrentUser();
              setUser(freshUser);
              authService.setUserData(freshUser);
            } catch (error) {
              console.warn("Failed to refresh user data:", error);
            }
          } else {
            // No stored user data, fetch from API
            const userData = await authService.getCurrentUser();
            setUser(userData);
            authService.setUserData(userData);
            
            // If user is on login page and authenticated, redirect to dashboard
            if (pathname === "/admin/login") {
              router.push("/dashboard");
            }
          }
        } else if (!isPublicRoute) {
          // Not authenticated and not on public route, redirect to login
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear any invalid tokens
        authService.logout();
        if (!isPublicRoute) {
          router.push("/admin/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [pathname, router, isPublicRoute]);

  const login = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      authService.setUserData(userData);
      router.push("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push("/admin/login");
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      authService.setUserData(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  // Show loading screen during authentication check
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Higher-order component to protect routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/admin/login");
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return <LoadingScreen message="Authenticating..." />;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
