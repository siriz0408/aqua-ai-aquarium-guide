import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  conversation_id: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
  preview?: string;
}

export const useChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }

      return data as Conversation[];
    },
    enabled: !!user,
  });

  // Fetch messages for current conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return data as Message[];
    },
    enabled: !!currentConversationId,
  });

  // Send message mutation - Updated for new subscription model
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, isNewConversation, attachments }: { 
      message: string; 
      isNewConversation?: boolean;
      attachments?: FileAttachment[];
    }) => {
      console.log('Sending message with attachments:', attachments?.length || 0);
      
      // Check if user is authenticated before attempting to send
      if (!user) {
        throw new Error('Please sign in to use the chat feature');
      }

      // Get the current session to ensure we have a valid access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        console.error('Session error:', sessionError);
        throw new Error('Your session has expired. Please sign in again.');
      }
      
      console.log('Session token available:', !!session.access_token);
      
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          message,
          conversationId: currentConversationId,
          isNewConversation: isNewConversation || !currentConversationId,
          attachments: attachments || []
        }
      });

      if (error) {
        console.error('Error invoking chat function:', error);
        // Provide more specific error messages based on the error type
        if (error.message?.includes('Auth session missing') || error.message?.includes('Unauthorized')) {
          throw new Error('Your session has expired. Please sign in again.');
        }
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.conversationId && data.conversationId !== currentConversationId) {
        setCurrentConversationId(data.conversationId);
      }
      
      // Invalidate and refetch conversations and messages
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      
      // Handle subscription access specifically
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.requiresUpgrade) {
            setShowPaywall(true);
            toast({
              title: "Upgrade Required",
              description: errorData.message,
              variant: "destructive",
            });
            return;
          }
        } catch {
          // Not JSON, handle as regular error
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Create new conversation
  const createNewConversation = () => {
    setCurrentConversationId(null);
  };

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (currentConversationId) {
        setCurrentConversationId(null);
      }
      toast({
        title: "Success",
        description: "Conversation deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation.",
        variant: "destructive",
      });
    },
  });

  const sendMessage = async (message: string, isNewConversation?: boolean, attachments?: FileAttachment[]) => {
    setIsLoading(true);
    try {
      await sendMessageMutation.mutateAsync({ message, isNewConversation, attachments });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    conversations,
    messages,
    currentConversationId,
    conversationsLoading,
    messagesLoading,
    isLoading,
    sendMessage,
    setCurrentConversationId,
    createNewConversation,
    deleteConversation: deleteConversationMutation.mutate,
    showPaywall,
    setShowPaywall,
  };
};
