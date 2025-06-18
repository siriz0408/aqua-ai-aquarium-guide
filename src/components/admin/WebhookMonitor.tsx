
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Webhook, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WebhookEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  processing_status: string;
  created_at: string;
  processed_at?: string;
  error_message?: string;
  user_email?: string;
}

export const WebhookMonitor: React.FC = () => {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchWebhookEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching webhook events:', error);
        toast({
          title: "Error",
          description: "Failed to fetch webhook events",
          variant: "destructive",
        });
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Exception fetching webhook events:', error);
      toast({
        title: "Error",
        description: "An error occurred while fetching webhook events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhookEvents();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl font-bold">Webhook Monitor</h2>
        </div>
        <Button onClick={fetchWebhookEvents} disabled={isLoading}>
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Webhook Events</CardTitle>
          <CardDescription>
            Monitor Stripe webhook events and their processing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No webhook events found
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(event.processing_status)}
                      <span className="font-medium">{event.event_type}</span>
                      <Badge variant={getStatusVariant(event.processing_status)}>
                        {event.processing_status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Event ID:</span>
                      <div className="text-muted-foreground font-mono text-xs">
                        {event.stripe_event_id}
                      </div>
                    </div>
                    
                    {event.user_email && (
                      <div>
                        <span className="font-medium">User Email:</span>
                        <div className="text-muted-foreground">
                          {event.user_email}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {event.processed_at && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Processed:</span>
                      <span className="text-muted-foreground ml-2">
                        {new Date(event.processed_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {event.error_message && (
                    <div className="mt-2">
                      <span className="font-medium text-red-600">Error:</span>
                      <div className="text-red-600 text-sm mt-1 p-2 bg-red-50 rounded">
                        {event.error_message}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
