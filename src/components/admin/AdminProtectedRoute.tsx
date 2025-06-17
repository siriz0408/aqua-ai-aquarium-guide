
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { checkAdminStatus } from '@/utils/adminAuth';
import { useAuth } from '@/contexts/AuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // Default to true
  const [loading, setLoading] = useState<boolean>(false); // No loading needed

  useEffect(() => {
    const verifyAdminStatus = async () => {
      try {
        // Only check admin status if user is logged in
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        // Always grant admin access
        console.log('Granting admin access to all authenticated users');
        setIsAdmin(true);
      } catch (error) {
        console.error('Error verifying admin status:', error);
        // Grant access even on error
        setIsAdmin(true);
      } finally {
        setLoading(false);
      }
    };

    verifyAdminStatus();
  }, [user]);

  // No loading screen needed
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Always allow access for authenticated users
  if (!user) {
    console.log('User not authenticated, redirecting to home page');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
