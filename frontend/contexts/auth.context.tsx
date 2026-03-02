'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { authApi } from '@/lib/api';
import type { AuthUser, LoginCredentials, RegisterData, ApiError } from '@/lib/types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Check for existing session on mount (skip on login page)
  useEffect(() => {
    // Skip auth check on login page to avoid unnecessary requests
    if (pathname === '/login') {
      setLoading(false);
      return;
    }
    checkAuthStatus();
  }, [pathname]);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Try to get current user with existing token
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // Token is invalid or expired
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);

      // Perform login - backend should return token
      const response = await authApi.login(credentials);

      // Store user data and token
      setUser(response.user);
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }

    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);

      // Perform registration - backend should return token
      const response = await authApi.register(data);

      // Store user data and token
      setUser(response.user);
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }

    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Call logout endpoint
      await authApi.logout();

    } catch (error) {
      // Even if logout fails, we should clear local state
      console.warn('Logout API call failed, but clearing local state anyway');
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // If refresh fails, user might be logged out
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false;
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    hasRole,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<T extends object>(
  Component: React.ComponentType<T>
) {
  return function AuthenticatedComponent(props: T) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login or show login component
      return <LoginRedirect />;
    }

    return <Component {...props} />;
  };
}

// Component to show when user needs to login
function LoginRedirect() {
  useEffect(() => {
    // In a real app, you might redirect to /login
    // For now, we'll just show a message
    console.log('User needs to login');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Acceso requerido</h2>
        <p className="text-muted-foreground">
          Debes iniciar sesión para acceder a esta página.
        </p>
      </div>
    </div>
  );
}