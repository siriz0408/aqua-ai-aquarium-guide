
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();

  // In the simplified version, there are no admin routes
  // Redirect to home if user is authenticated, otherwise to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Navigate to="/" replace />;
};
