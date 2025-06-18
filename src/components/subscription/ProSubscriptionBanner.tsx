
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ProSubscriptionBanner: React.FC = () => {
  const { toast } = useToast();

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-800">
                Pro Subscription Active
              </h3>
              <p className="text-sm text-blue-600">
                Unlimited access to all features
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600">
              Pro
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManageSubscription}
            >
              Manage
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
