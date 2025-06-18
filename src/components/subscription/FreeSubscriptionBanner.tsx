
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PRICE_IDS = {
  pro: "price_pro_monthly",  // Replace with your actual Stripe price ID
};

export const FreeSubscriptionBanner: React.FC = () => {
  const { toast } = useToast();

  const handleUpgrade = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6 border-gray-200 bg-gray-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-gray-600" />
            <div>
              <h3 className="font-semibold text-gray-800">
                Free Plan
              </h3>
              <p className="text-sm text-gray-600">
                Limited access to features. Upgrade for unlimited access.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Free
            </Badge>
            <Button 
              size="sm"
              onClick={() => handleUpgrade(PRICE_IDS.pro)}
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
