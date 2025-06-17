
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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAdminStatus = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          console.log('No user found, denying admin access');
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        console.log('Verifying admin status for user:', user.id);
        const { isAdmin: adminStatus } = await checkAdminStatus();
        
        console.log('Admin verification result:', adminStatus);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error verifying admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAdminStatus();
  }, [user]);

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

  if (!user) {
    console.log('User not authenticated, redirecting to home page');
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    console.log('User is not admin, redirecting to home page');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
