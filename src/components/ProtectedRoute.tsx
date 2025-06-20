
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { Loader2 } from 'lucide-react';
import { SubscriptionPrompt } from '@/components/subscription/SubscriptionPrompt';
import { ExpiredTrialPaywall } from '@/components/subscription/ExpiredTrialPaywall';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresSubscription?: boolean; // For routes that need subscription access
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresSubscription = true // Default to true for 100% paywall
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const {
    accessData,
    shouldShowPaywall,
    shouldShowSubscriptionPrompt,
    isLoading: subscriptionLoading,
    hasActiveSubscription,
    isTrialActive,
    isAdmin
  } = useSubscriptionAccess();

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

  // For routes that require subscription (most routes in 100% paywall)
  if (requiresSubscription) {
    // Show subscription prompt for users who can start trial
    if (shouldShowSubscriptionPrompt()) {
      return <SubscriptionPrompt isFullScreen />;
    }

    // Show paywall for expired trials or users who can't start trials
    if (shouldShowPaywall()) {
      return <ExpiredTrialPaywall isFullScreen />;
    }

    // Check if user has access (admin, active subscription, or active trial)
    const hasAccess = isAdmin || hasActiveSubscription || isTrialActive;
    
    if (!hasAccess) {
      return <SubscriptionPrompt isFullScreen />;
    }
  }

  // User has access, render the protected content
  return <>{children}</>;
};
