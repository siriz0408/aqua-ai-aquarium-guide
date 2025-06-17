
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from './useAdminAuth';

export const useAdminTickets = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { logAdminActivity } = useAdminAuth();

  const ticketsQuery = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles!user_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-responses', variables.ticketId] });
      logAdminActivity('ticket_updated', 'ticket', variables.ticketId, variables.updates);
      toast({
        title: "Ticket updated",
        description: "Support ticket has been updated.",
      });
    }
  });

  const addResponseMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const { data, error } = await supabase
        .from('support_ticket_responses')
        .insert({
          ticket_id: ticketId,
          message,
          from_admin: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-responses', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      logAdminActivity('ticket_response_added', 'ticket', variables.ticketId);
      toast({
        title: "Response added",
        description: "Your response has been added to the ticket.",
      });
    }
  });

  const getTicketResponses = (ticketId: string) => {
    return useQuery({
      queryKey: ['ticket-responses', ticketId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('support_ticket_responses')
          .select(`
            *,
            profiles!user_id(full_name, email)
          `)
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
      },
      enabled: !!ticketId
    });
  };

  return {
    tickets: ticketsQuery.data || [],
    isLoading: ticketsQuery.isLoading,
    updateTicket: updateTicketMutation.mutate,
    addResponse: addResponseMutation.mutate,
    getTicketResponses,
    refetch: ticketsQuery.refetch
  };
};
