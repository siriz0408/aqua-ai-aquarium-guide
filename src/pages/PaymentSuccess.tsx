
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProSubscriptionAccess } from '@/hooks/useProSubscriptionAccess';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { refresh } = useProSubscriptionAccess();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;
  
  const sessionId = searchParams.get('session_id');

  const checkSubscriptionStatus = async () => {
    if (!user?.email) return;

    try {
      setIsRefreshing(true);
      
      // First refresh the subscription access
      await refresh();
      
      // Get profile information directly from database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_tier, stripe_subscription_id, stripe_customer_id, subscription_end_date')
        .eq('email', user.email)
        .single();
      
      if (profileError) {
        console.error('Profile lookup error:', profileError);
      } else {
        setDebugInfo(profileData);
        console.log('Subscription profile info:', profileData);
        
        // Check if subscription is now active
        if (profileData?.subscription_status === 'active' && 
            profileData?.subscription_tier === 'pro') {
          toast({
            title: "Subscription Activated!",
            description: "Your AquaAI Pro subscription is now active.",
          });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user?.email) return;

    const pollSubscriptionStatus = async () => {
      const isActive = await checkSubscriptionStatus();
      
      if (!isActive && retryCount < maxRetries) {
        // If subscription is not active yet, retry after a delay
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, delay);
      }
    };

    // Initial check
    pollSubscriptionStatus();
  }, [user?.email, retryCount]);

  const handleGoToDashboard = () => {
    navigate('/');
  };

  const handleRetrySync = async () => {
    setRetryCount(0);
    await checkSubscriptionStatus();
  };

  const isSubscriptionActive = debugInfo?.subscription_status === 'active' && 
                               debugInfo?.subscription_tier === 'pro';

  return (
    <Layout title="Payment Successful - AquaAI">
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              {isSubscriptionActive ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : isRefreshing ? (
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              ) : (
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              )}
            </div>
            <CardTitle className="text-2xl text-green-800 dark:text-green-200">
              {isSubscriptionActive ? 'Subscription Active!' : 'Payment Received'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div>
              {isSubscriptionActive ? (
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Welcome to AquaAI Pro! Your subscription is now active and ready to use.
                </p>
              ) : (
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Your payment was successful. We're activating your subscription...
                </p>
              )}
              {sessionId && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Session ID: {sessionId}
                </p>
              )}
            </div>

            {isRefreshing && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking subscription status... (Attempt {retryCount + 1}/{maxRetries + 1})
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard
              </Button>
              
              {!isSubscriptionActive && !isRefreshing && (
                <Button onClick={handleRetrySync} variant="outline" className="w-full">
                  Check Status Again
                </Button>
              )}
              
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p>🎉 You now have access to:</p>
                <ul className="mt-2 space-y-1">
                  <li>• AI-Powered AquaBot Assistant</li>
                  <li>• Advanced Setup Planner</li>
                  <li>• Unlimited Tank Management</li>
                  <li>• Parameter Analysis & Tracking</li>
                </ul>
              </div>
            </div>

            {/* Debug information (only show in development or for admins) */}
            {debugInfo && (
              <details className="text-left text-xs">
                <summary className="cursor-pointer text-gray-500">Debug Info</summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
