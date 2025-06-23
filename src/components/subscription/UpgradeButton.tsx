
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Crown } from 'lucide-react';
import { PRICING_PLANS } from '@/config/pricing';

export function UpgradeButton() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      toast({ 
        title: "Please sign in to upgrade", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      // Use the monthly plan by default
      const monthlyPlan = PRICING_PLANS.find(plan => plan.interval === 'month');
      if (!monthlyPlan) {
        throw new Error('Monthly plan not found');
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: monthlyPlan.priceId
        }
      });

      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({ 
        title: "Error creating checkout", 
        description: "Please try again later.",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleUpgrade} disabled={loading}>
      <Crown className="mr-2 h-4 w-4" />
      {loading ? "Loading..." : "Subscribe to Pro"}
    </Button>
  );
}
