
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Crown } from 'lucide-react';

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
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: 'price_1Rb8vR1d1AvgoBGoNIjxLKRR', // Monthly Pro price ID
          mode: 'subscription'
        }
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
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
      {loading ? "Loading..." : "Upgrade to Pro"}
    </Button>
  );
}
