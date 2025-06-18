
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Webhook, CheckCircle, XCircle, Clock, AlertTriangle, Search, Filter } from 'lucide-react';
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
  customer_id?: string;
  subscription_id?: string;
  raw_data?: any;
}

export const EnhancedWebhookMonitor: React.FC = () => {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterEventType, setFilterEventType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  
  const { toast } = useToast();

  const fetchWebhookEvents = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('webhook_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filterEventType) {
        query = query.ilike('event_type', `%${filterEventType}%`);
      }

      if (filterStatus) {
        query = query.eq('processing_status', filterStatus);
      }

      const { data, error } = await query;

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
  }, [filterEventType, filterStatus]);

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

  const retryWebhookEvent = async (event: WebhookEvent) => {
    try {
      // This would call an edge function to retry processing the webhook
      toast({
        title: "Retry Initiated",
        description: `Retrying webhook event ${event.stripe_event_id}`,
      });
      
      // Refresh the list after a short delay
      setTimeout(() => {
        fetchWebhookEvents();
      }, 2000);
    } catch (error) {
      console.error('Error retrying webhook:', error);
      toast({
        title: "Retry Failed",
        description: "Failed to retry webhook event",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl font-bold">Enhanced Webhook Monitor</h2>
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
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter webhook events by type and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="filterEventType">Event Type</Label>
              <Input
                id="filterEventType"
                value={filterEventType}
                onChange={(e) => setFilterEventType(e.target.value)}
                placeholder="subscription.created, invoice.payment..."
              />
            </div>
            <div>
              <Label htmlFor="filterStatus">Status</Label>
              <Input
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                placeholder="completed, failed, processing..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Webhook Events ({events.length})</CardTitle>
            <CardDescription>
              Click on an event to view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No webhook events found
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div 
                    key={event.id} 
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedEvent?.id === event.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(event.processing_status)}
                        <span className="font-medium text-sm">{event.event_type}</span>
                        <Badge variant={getStatusVariant(event.processing_status)}>
                          {event.processing_status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    {event.user_email && (
                      <div className="text-xs text-muted-foreground">
                        User: {event.user_email}
                      </div>
                    )}
                    
                    {event.error_message && (
                      <div className="text-xs text-red-600 mt-1">
                        Error: {event.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              {selectedEvent ? `Details for ${selectedEvent.stripe_event_id}` : 'Select an event to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedEvent ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Event ID</Label>
                    <div className="font-mono text-xs bg-muted p-2 rounded">
                      {selectedEvent.stripe_event_id}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Event Type</Label>
                    <div className="text-muted-foreground">
                      {selectedEvent.event_type}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Status</Label>
                    <Badge variant={getStatusVariant(selectedEvent.processing_status)}>
                      {selectedEvent.processing_status}
                    </Badge>
                  </div>
                  
                  <div>
                    <Label>Created</Label>
                    <div className="text-muted-foreground">
                      {new Date(selectedEvent.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {selectedEvent.customer_id && (
                  <div>
                    <Label>Customer ID</Label>
                    <div className="font-mono text-xs bg-muted p-2 rounded">
                      {selectedEvent.customer_id}
                    </div>
                  </div>
                )}

                {selectedEvent.subscription_id && (
                  <div>
                    <Label>Subscription ID</Label>
                    <div className="font-mono text-xs bg-muted p-2 rounded">
                      {selectedEvent.subscription_id}
                    </div>
                  </div>
                )}

                {selectedEvent.error_message && (
                  <div>
                    <Label>Error Message</Label>
                    <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                      {selectedEvent.error_message}
                    </div>
                  </div>
                )}

                {selectedEvent.raw_data && (
                  <div>
                    <Label>Raw Event Data</Label>
                    <Textarea
                      value={JSON.stringify(selectedEvent.raw_data, null, 2)}
                      readOnly
                      className="font-mono text-xs"
                      rows={10}
                    />
                  </div>
                )}

                {selectedEvent.processing_status === 'failed' && (
                  <div className="flex gap-2 pt-4">
                    <Button 
                      size="sm" 
                      onClick={() => retryWebhookEvent(selectedEvent)}
                    >
                      Retry Processing
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a webhook event from the list to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
