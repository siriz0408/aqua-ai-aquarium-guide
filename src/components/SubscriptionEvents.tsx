
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, CreditCard, UserPlus, Trash2 } from 'lucide-react';

interface SubscriptionEvent {
  id: string;
  event_type: string;
  created_at: string;
  event_data: any;
  processed: boolean;
}

export const SubscriptionEvents: React.FC = () => {
  const { user } = useAuth();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['subscription-events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('subscription_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as SubscriptionEvent[];
    },
    enabled: !!user?.id,
  });

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'customer.subscription.created':
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'customer.subscription.updated':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'customer.subscription.deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'invoice.payment_succeeded':
        return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'invoice.payment_failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventDescription = (eventType: string) => {
    switch (eventType) {
      case 'customer.subscription.created':
        return 'Subscription created';
      case 'customer.subscription.updated':
        return 'Subscription updated';
      case 'customer.subscription.deleted':
        return 'Subscription cancelled';
      case 'invoice.payment_succeeded':
        return 'Payment successful';
      case 'invoice.payment_failed':
        return 'Payment failed';
      default:
        return eventType.replace(/[._]/g, ' ');
    }
  };

  const getEventBadgeVariant = (eventType: string) => {
    if (eventType.includes('succeeded') || eventType.includes('created')) {
      return 'default';
    }
    if (eventType.includes('failed') || eventType.includes('deleted')) {
      return 'destructive';
    }
    return 'secondary';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription History</CardTitle>
          <CardDescription>Loading subscription events...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription History</CardTitle>
        <CardDescription>
          Recent subscription and payment events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No subscription events found
          </p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <div className="flex-shrink-0">
                  {getEventIcon(event.event_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {getEventDescription(event.event_type)}
                    </p>
                    <Badge variant={getEventBadgeVariant(event.event_type)} className="text-xs">
                      {event.processed ? 'Processed' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
