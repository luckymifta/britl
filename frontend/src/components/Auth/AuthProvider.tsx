"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService, type User } from "@/services/auth.service";

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
  const publicRoutes = ["/auth/sign-in", "/auth/sign-up", "/"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check local authentication first
        if (authService.isAuthenticated()) {
          const storedUser = authService.getUserData();
          if (storedUser) {
            setUser(storedUser);
            
            // Validate session with server
            const sessionData = await authService.validateSession();
            if (sessionData?.valid && sessionData.user) {
              setUser(sessionData.user);
            } else {
              // Session invalid, clear auth
              authService.logout();
              setUser(null);
              if (!isPublicRoute) {
                router.push("/auth/sign-in");
              }
            }
          } else {
            // No stored user but has token, fetch user data
            try {
              const userData = await authService.getCurrentUser();
              setUser(userData);
            } catch (error) {
              console.error("Failed to get user data:", error);
              authService.logout();
              if (!isPublicRoute) {
                router.push("/auth/sign-in");
              }
            }
          }
        } else if (!isPublicRoute) {
          // Not authenticated and trying to access protected route
          router.push("/auth/sign-in");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        authService.logout();
        setUser(null);
        if (!isPublicRoute) {
          router.push("/auth/sign-in");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [pathname, router, isPublicRoute]);

  // Set up session validation interval
  useEffect(() => {
    if (user && authService.isAuthenticated()) {
      const interval = setInterval(async () => {
        const sessionData = await authService.validateSession();
        if (!sessionData?.valid) {
          logout();
        }
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [user]);

  // Listen for automatic logout events
  useEffect(() => {
    const handleAutoLogout = () => {
      setUser(null);
      router.push("/auth/sign-in");
    };

    window.addEventListener('auth:auto-logout', handleAutoLogout);
    return () => window.removeEventListener('auth:auto-logout', handleAutoLogout);
  }, [router]);

  // Handle browser tab focus - validate session when user returns
  useEffect(() => {
    const handleFocus = async () => {
      if (user && authService.isAuthenticated()) {
        const sessionData = await authService.validateSession();
        if (!sessionData?.valid) {
          logout();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const loginData = await authService.login(email, password);
      setUser(loginData.user);
      
      // Redirect to admin dashboard after successful login
      router.push("/admin");
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push("/auth/sign-in");
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && authService.isAuthenticated(),
    login,
    logout,
    refreshUser,
  };

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
        router.push("/auth/sign-in");
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Authenticating...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
