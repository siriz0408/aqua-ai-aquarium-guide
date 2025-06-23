
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentType, setPaymentType] = useState<'subscription' | 'onetime' | null>(null);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        return;
      }

      try {
        // Check subscription status to refresh user data
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error('Error checking subscription:', error);
        } else {
          console.log('Subscription check result:', data);
          if (data?.subscribed) {
            setPaymentType('subscription');
          } else {
            setPaymentType('onetime');
          }
        }

        toast({
          title: "Payment Successful! 🎉",
          description: "Welcome to AquaAI Pro! Your account has been upgraded.",
        });
      } catch (error) {
        console.error('Payment verification error:', error);
        toast({
          title: "Payment Processed",
          description: "Your payment was successful. Welcome to AquaAI Pro!",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, toast]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-800 mb-2">
            Payment Successful!
          </CardTitle>
          <p className="text-gray-600">
            {paymentType === 'subscription' 
              ? 'Your Pro subscription is now active'
              : 'Your lifetime access has been activated'
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-blue-800">What's Next?</h3>
            </div>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                Priority customer support is now available
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                Advanced analytics and insights unlocked
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                Export your aquarium data anytime
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                Unlimited tank management
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate('/')}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/aquabot')}
              className="flex-1"
            >
              Try AquaBot Assistant
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Questions? Contact us at support@aquaai.app
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
