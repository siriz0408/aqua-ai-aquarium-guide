
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
        
        // Use the safe admin check function directly
        const { data: adminStatus, error } = await supabase
          .rpc('check_user_admin_status', { user_id: user.id });
        
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          console.log('Admin verification result:', adminStatus);
          setIsAdmin(adminStatus || false);
        }
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
    console.log('User not authenticated, redirecting to auth page');
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    console.log('User is not admin, redirecting to home page');
    return <Navigate to="/" replace />;
  }

  console.log('Admin access granted, rendering admin content');
  return <>{children}</>;
};
