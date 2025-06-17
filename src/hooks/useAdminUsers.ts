
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from './useAdminAuth';

export const useAdminUsers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { logAdminActivity } = useAdminAuth();

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      logAdminActivity('user_updated', 'user', variables.userId, variables.updates);
      toast({
        title: "User updated",
        description: "User profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Failed to update user profile.",
        variant: "destructive",
      });
    }
  });

  const addAdminNoteMutation = useMutation({
    mutationFn: async ({ userId, note, noteType }: { userId: string; note: string; noteType: string }) => {
      const { data, error } = await supabase
        .from('admin_notes')
        .insert({
          user_id: userId,
          note,
          note_type: noteType
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-notes', variables.userId] });
      logAdminActivity('admin_note_added', 'user', variables.userId);
      toast({
        title: "Note added",
        description: "Admin note has been added to user profile.",
      });
    }
  });

  const getUserNotes = (userId: string) => {
    return useQuery({
      queryKey: ['admin-user-notes', userId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('admin_notes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      },
      enabled: !!userId
    });
  };

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    updateUser: updateUserMutation.mutate,
    addAdminNote: addAdminNoteMutation.mutate,
    getUserNotes,
    refetch: usersQuery.refetch
  };
};
