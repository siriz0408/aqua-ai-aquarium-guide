
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WebhookEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  processing_status: string;
  error_message?: string;
  user_email?: string;
  customer_id?: string;
  subscription_id?: string;
  created_at: string;
  processed_at?: string;
  raw_data?: any;
}

export const EnhancedWebhookMonitor: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);

  const { data: webhookEvents, isLoading, refetch } = useQuery({
    queryKey: ['webhook-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as WebhookEvent[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status}
      </Badge>
    );
  };

  const groupedEvents = webhookEvents?.reduce((groups, event) => {
    const status = event.processing_status;
    if (!groups[status]) groups[status] = [];
    groups[status].push(event);
    return groups;
  }, {} as Record<string, WebhookEvent[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading webhook events...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Webhook Monitor</h2>
          <p className="text-gray-600">Monitor Stripe webhook events and processing status</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(groupedEvents || {}).map(([status, events]) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(status)}
                <div>
                  <p className="text-sm font-medium capitalize">{status}</p>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="failed">Failed Events</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <EventsList 
            events={webhookEvents || []} 
            onSelectEvent={setSelectedEvent}
          />
        </TabsContent>

        <TabsContent value="failed">
          <EventsList 
            events={webhookEvents?.filter(e => e.processing_status === 'failed') || []}
            onSelectEvent={setSelectedEvent}
          />
        </TabsContent>

        <TabsContent value="completed">
          <EventsList 
            events={webhookEvents?.filter(e => e.processing_status === 'completed') || []}
            onSelectEvent={setSelectedEvent}
          />
        </TabsContent>

        <TabsContent value="processing">
          <EventsList 
            events={webhookEvents?.filter(e => e.processing_status === 'processing') || []}
            onSelectEvent={setSelectedEvent}
          />
        </TabsContent>
      </Tabs>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </div>
  );
};

interface EventsListProps {
  events: WebhookEvent[];
  onSelectEvent: (event: WebhookEvent) => void;
}

const EventsList: React.FC<EventsListProps> = ({ events, onSelectEvent }) => {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No webhook events found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Events</CardTitle>
        <CardDescription>
          Recent Stripe webhook events and their processing status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectEvent(event)}
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(event.processing_status)}
                  <div>
                    <p className="font-medium">{event.event_type}</p>
                    <p className="text-sm text-gray-600">{event.stripe_event_id}</p>
                    {event.user_email && (
                      <p className="text-sm text-blue-600">{event.user_email}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(event.processing_status)}
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

interface EventDetailsModalProps {
  event: WebhookEvent;
  onClose: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Webhook Event Details</h3>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </div>
        
        <ScrollArea className="p-6 max-h-[60vh]">
          <div className="space-y-4">
            <div>
              <label className="font-medium">Event Type:</label>
              <p>{event.event_type}</p>
            </div>
            
            <div>
              <label className="font-medium">Stripe Event ID:</label>
              <p className="text-sm font-mono">{event.stripe_event_id}</p>
            </div>
            
            <div>
              <label className="font-medium">Status:</label>
              {getStatusBadge(event.processing_status)}
            </div>
            
            {event.user_email && (
              <div>
                <label className="font-medium">User Email:</label>
                <p>{event.user_email}</p>
              </div>
            )}
            
            {event.customer_id && (
              <div>
                <label className="font-medium">Customer ID:</label>
                <p className="text-sm font-mono">{event.customer_id}</p>
              </div>
            )}
            
            {event.subscription_id && (
              <div>
                <label className="font-medium">Subscription ID:</label>
                <p className="text-sm font-mono">{event.subscription_id}</p>
              </div>
            )}
            
            <div>
              <label className="font-medium">Created At:</label>
              <p>{new Date(event.created_at).toLocaleString()}</p>
            </div>
            
            {event.processed_at && (
              <div>
                <label className="font-medium">Processed At:</label>
                <p>{new Date(event.processed_at).toLocaleString()}</p>
              </div>
            )}
            
            {event.error_message && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {event.error_message}
                </AlertDescription>
              </Alert>
            )}
            
            {event.raw_data && (
              <div>
                <label className="font-medium">Raw Event Data:</label>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                  {JSON.stringify(event.raw_data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'processing':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
}

function getStatusBadge(status: string) {
  const variants = {
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    processing: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-gray-100 text-gray-800',
  };
  
  return (
    <Badge className={variants[status as keyof typeof variants] || variants.pending}>
      {status}
    </Badge>
  );
}
