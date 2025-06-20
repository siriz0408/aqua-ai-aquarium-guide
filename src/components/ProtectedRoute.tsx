
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProSubscriptionAccess } from '@/hooks/useProSubscriptionAccess';
import { Loader2 } from 'lucide-react';
import { ProSubscriptionPrompt } from '@/components/subscription/ProSubscriptionPrompt';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresSubscription?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresSubscription = true // Default to true for 100% paywall
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const {
    status,
    isLoading: subscriptionLoading,
    hasAccess,
    isAdmin,
    isPaidSubscriber
  } = useProSubscriptionAccess();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth and subscription
  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // User not authenticated
  if (!user) {
    return null;
  }

  // For routes that require subscription (100% paywall)
  if (requiresSubscription) {
    // Check if user has access (admin or paid subscriber ONLY)
    if (!hasAccess) {
      return <ProSubscriptionPrompt isFullScreen />;
    }
  }

  // User has access, render the protected content
  return <>{children}</>;
};
