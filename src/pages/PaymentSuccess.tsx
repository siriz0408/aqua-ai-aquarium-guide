
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProSubscriptionAccess } from '@/hooks/useProSubscriptionAccess';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { refresh } = useProSubscriptionAccess();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh subscription status after successful payment
    const refreshSubscription = async () => {
      if (user) {
        setIsRefreshing(true);
        try {
          await refresh();
        } catch (error) {
          console.error('Failed to refresh subscription:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    refreshSubscription();
  }, [user, refresh]);

  const handleGoToDashboard = () => {
    navigate('/');
  };

  return (
    <Layout title="Payment Successful - AquaAI">
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800 dark:text-green-200">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Welcome to AquaAI Pro! Your subscription is now active.
              </p>
              {sessionId && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Session ID: {sessionId}
                </p>
              )}
            </div>

            {isRefreshing && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                Activating your subscription...
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard
              </Button>
              
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
