
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart } from 'lucide-react';

const PRODUCT_ID = "prod_SWBItVMEChp6DI";

interface OneTimePaymentButtonProps {
  productName?: string;
  price?: string;
  description?: string;
}

export const OneTimePaymentButton: React.FC<OneTimePaymentButtonProps> = ({
  productName = "Pro Features Access",
  price = "$4.99",
  description = "One-time purchase for premium features"
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to make a purchase.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting one-time payment process for product:', PRODUCT_ID);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { productId: PRODUCT_ID }
      });

      if (error) {
        console.error('Payment creation error:', error);
        throw error;
      }

      console.log('Payment session created:', data);

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      toast({
        title: "Error",
        description: "Failed to start payment process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 shadow-sm">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{productName}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
        <div className="text-2xl font-bold text-blue-600 mb-4">{price}</div>
        <Button 
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isLoading ? "Processing..." : "Buy Now"}
        </Button>
      </div>
    </div>
  );
};
