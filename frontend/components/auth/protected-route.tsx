'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  fallback
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, hasPermission, hasRole, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (requiredPermission && !hasPermission(requiredPermission)) {
        if (fallback) {
          // Show fallback if provided
          return;
        }
        // Redirect to dashboard or show unauthorized
        router.push('/');
        return;
      }

      if (requiredRole && !hasRole(requiredRole)) {
        if (fallback) {
          return;
        }
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, loading, requiredPermission, requiredRole, hasPermission, hasRole, router, fallback]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Check permissions
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
            <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  // Check roles
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
            <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            Se requiere el rol de {requiredRole} para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook for checking permissions in components
export function usePermissionCheck() {
  const { hasPermission, hasRole } = useAuth();

  return {
    hasPermission,
    hasRole,
    canView: (resource: string) => hasPermission(`${resource}.view`),
    canCreate: (resource: string) => hasPermission(`${resource}.create`),
    canEdit: (resource: string) => hasPermission(`${resource}.edit`),
    canDelete: (resource: string) => hasPermission(`${resource}.delete`),
  };
}