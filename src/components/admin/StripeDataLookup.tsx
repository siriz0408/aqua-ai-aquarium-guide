
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const StripeDataLookup: React.FC = () => {
  const [lookupValue, setLookupValue] = useState('');
  const [lookupResults, setLookupResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const handleLookup = async () => {
    if (!lookupValue.trim()) {
      toast({
        title: "Missing Input",
        description: "Please enter an email or Stripe ID to lookup",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // This would call a Stripe lookup function - placeholder for now
      // In a real implementation, you'd call an edge function that queries Stripe
      const mockResult = {
        customer: {
          id: 'cus_example123',
          email: lookupValue,
          created: '2024-01-15',
        },
        subscriptions: [
          {
            id: 'sub_example456',
            status: 'active',
            current_period_end: '2024-02-15',
            price_id: 'price_1Rb8vR1d1AvgoBGoNIjxLKRR'
          }
        ]
      };
      
      setLookupResults(mockResult);
      
      toast({
        title: "Lookup Complete",
        description: "Stripe data retrieved successfully",
      });
    } catch (error) {
      console.error('Lookup error:', error);
      toast({
        title: "Lookup Failed",
        description: "Failed to retrieve Stripe data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Value copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Stripe Data Lookup
          </CardTitle>
          <CardDescription>
            Look up customer and subscription data from Stripe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="lookupValue">Email or Stripe ID</Label>
            <Input
              id="lookupValue"
              value={lookupValue}
              onChange={(e) => setLookupValue(e.target.value)}
              placeholder="user@example.com or cus_... or sub_..."
            />
          </div>

          <Button 
            onClick={handleLookup} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Search className="h-4 w-4 mr-2 animate-pulse" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Lookup in Stripe
          </Button>
        </CardContent>
      </Card>

      {lookupResults && (
        <Card>
          <CardHeader>
            <CardTitle>Stripe Data Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lookupResults.customer && (
              <div className="space-y-2">
                <Label>Customer Information</Label>
                <div className="bg-muted p-3 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Customer ID:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        {lookupResults.customer.id}
                      </code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(lookupResults.customer.id)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email:</span>
                    <span className="text-sm">{lookupResults.customer.email}</span>
                  </div>
                </div>
              </div>
            )}

            {lookupResults.subscriptions && lookupResults.subscriptions.length > 0 && (
              <div className="space-y-2">
                <Label>Subscriptions</Label>
                {lookupResults.subscriptions.map((sub: any, index: number) => (
                  <div key={index} className="bg-muted p-3 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Subscription ID:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-background px-2 py-1 rounded">
                          {sub.id}
                        </code>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyToClipboard(sub.id)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Period End:</span>
                      <span className="text-sm">{sub.current_period_end}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Stripe Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
