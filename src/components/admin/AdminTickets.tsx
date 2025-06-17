
import React, { useState } from 'react';
import { useAdminTickets } from '@/hooks/useAdminTickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Clock, User } from 'lucide-react';

const AdminTickets = () => {
  const { tickets, isLoading, updateTicket, addResponse, getTicketResponses } = useAdminTickets();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [responseText, setResponseText] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const handleStatusChange = (ticketId: string, status: string) => {
    updateTicket({
      ticketId,
      updates: { 
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null
      }
    });
  };

  const handleAddResponse = () => {
    if (selectedTicket && responseText.trim()) {
      addResponse({
        ticketId: selectedTicket.id,
        message: responseText
      });
      setResponseText('');
    }
  };

  const TicketDetailDialog = ({ ticket }: { ticket: any }) => {
    const { data: responses } = getTicketResponses(ticket.id);

    return (
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {ticket.subject}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <Select 
                defaultValue={ticket.status} 
                onValueChange={(status) => handleStatusChange(ticket.id, status)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Priority</p>
              <Select 
                defaultValue={ticket.priority}
                onValueChange={(priority) => updateTicket({ ticketId: ticket.id, updates: { priority } })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Original Message */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4" />
              <span className="font-medium">{ticket.profiles?.full_name || 'User'}</span>
              <span className="text-sm text-gray-500">{ticket.profiles?.email}</span>
              <span className="text-sm text-gray-400">
                {new Date(ticket.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-700">{ticket.message}</p>
          </div>

          {/* Responses */}
          {responses && responses.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Responses</h3>
              {responses.map((response) => (
                <div key={response.id} className={`border rounded-lg p-4 ${response.from_admin ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">
                      {response.from_admin ? 'Admin' : response.profiles?.full_name || 'User'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(response.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{response.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Response */}
          <div className="space-y-3">
            <Label>Add Response</Label>
            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Type your response..."
              rows={4}
            />
            <Button onClick={handleAddResponse} className="w-full">
              Send Response
            </Button>
          </div>
        </div>
      </DialogContent>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-600">Manage customer support requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                      <Badge variant={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <Badge variant={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2 line-clamp-2">{ticket.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {ticket.profiles?.full_name || 'Unknown'} ({ticket.profiles?.email})
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(ticket.created_at).toLocaleString()}
                      </span>
                      <span>Responses: {ticket.response_count || 0}</span>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <TicketDetailDialog ticket={ticket} />
                  </Dialog>
                </div>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No support tickets found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTickets;
