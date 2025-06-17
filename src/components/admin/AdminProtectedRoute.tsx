
import React from 'react';
import { useCredits } from '@/hooks/useCredits';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { profile, profileLoading } = useCredits();

  // Show loading while checking permissions
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect if not admin
  if (!profile?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
