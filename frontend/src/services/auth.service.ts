export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  user: User;
}

export interface AuthCheckResponse {
  authenticated: boolean;
  expires_at?: string;
}

export interface SessionValidationResponse {
  valid: boolean;
  token_refreshed: boolean;
  new_token?: string;
  expires_at?: string;
  user?: User;
}

class AuthService {
  private readonly API_BASE = 'http://localhost:8000/api'; // Direct backend API call
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private readonly EXPIRES_KEY = 'token_expires';
  private logoutTimer: NodeJS.Timeout | null = null;

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${this.API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || 'Login failed');
    }

    const data: LoginResponse = await response.json();
    
    // Store token and user data
    this.setToken(data.access_token);
    this.setUserData(data.user);
    this.setExpiresAt(data.expires_at);
    
    // Set up automatic logout at midnight
    this.setupAutomaticLogout(data.expires_at);

    return data;
  }

  /**
   * Logout the user
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }

    this.clearAuth();
  }

  /**
   * Check if user is authenticated
   */
  async checkAuth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/check-auth`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data: AuthCheckResponse = await response.json();
        return data.authenticated;
      }
      
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }

  /**
   * Validate and refresh session if needed
   */
  async validateSession(): Promise<SessionValidationResponse | null> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/validate-session`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data: SessionValidationResponse = await response.json();
        
        if (data.valid && data.user) {
          this.setUserData(data.user);
          
          // If token was refreshed, update stored data
          if (data.token_refreshed && data.new_token && data.expires_at) {
            this.setToken(data.new_token);
            this.setExpiresAt(data.expires_at);
            this.setupAutomaticLogout(data.expires_at);
          }
        }
        
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Session validation failed:', error);
      return null;
    }
  }

  /**
   * Get current user data
   */
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.API_BASE}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user data');
    }

    const user: User = await response.json();
    this.setUserData(user);
    return user;
  }

  /**
   * Check if user is authenticated locally
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiresAt = this.getExpiresAt();
    
    if (!token || !expiresAt) {
      return false;
    }
    
    // Check if token has expired
    const now = new Date();
    const expiryDate = new Date(expiresAt);
    
    if (now >= expiryDate) {
      this.clearAuth();
      return false;
    }
    
    return true;
  }

  /**
   * Set up automatic logout at midnight
   */
  private setupAutomaticLogout(expiresAt: string): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiryDate.getTime() - now.getTime();

    if (timeUntilExpiry > 0) {
      this.logoutTimer = setTimeout(() => {
        this.clearAuth();
        // Dispatch custom event for components to handle logout
        window.dispatchEvent(new CustomEvent('auth:auto-logout'));
      }, timeUntilExpiry);
    }
  }

  /**
   * Clear all authentication data
   */
  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.EXPIRES_KEY);
    }
    
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  /**
   * Token management
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * User data management
   */
  getUserData(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  setUserData(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Expiry management
   */
  getExpiresAt(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.EXPIRES_KEY);
  }

  setExpiresAt(expiresAt: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.EXPIRES_KEY, expiresAt);
    }
  }
}

export const authService = new AuthService();
