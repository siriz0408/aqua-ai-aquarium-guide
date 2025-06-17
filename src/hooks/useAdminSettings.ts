
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from './useAdminAuth';

export const useAdminSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { logAdminActivity } = useAdminAuth();

  const adminUsersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const invitationsQuery = useQuery({
    queryKey: ['admin-invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_invitations')
        .select('*')
        .eq('accepted', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const inviteAdminMutation = useMutation({
    mutationFn: async ({ email, role, permissions }: { 
      email: string; 
      role: 'admin' | 'super_admin'; 
      permissions: string[] 
    }) => {
      const { data, error } = await supabase
        .from('admin_invitations')
        .insert({
          email,
          admin_role: role,
          permissions
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] });
      logAdminActivity('admin_invited', 'user', null, { email: variables.email, role: variables.role });
      toast({
        title: "Invitation sent",
        description: `Admin invitation sent to ${variables.email}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send invitation",
        description: "There was an error sending the admin invitation.",
        variant: "destructive",
      });
    }
  });

  const updateAdminRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'super_admin' }) => {
      const permissions = role === 'super_admin' 
        ? ['user_management', 'ticket_management', 'analytics', 'settings', 'admin_management']
        : ['ticket_management', 'analytics'];

      const { data, error } = await supabase
        .from('profiles')
        .update({
          admin_role: role,
          admin_permissions: permissions
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      logAdminActivity('admin_role_updated', 'user', variables.userId, { new_role: variables.role });
      toast({
        title: "Role updated",
        description: "Admin role has been updated successfully.",
      });
    }
  });

  const removeAdminMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_admin: false,
          admin_role: null,
          admin_permissions: null
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      logAdminActivity('admin_removed', 'user', variables.userId);
      toast({
        title: "Admin removed",
        description: "User's admin privileges have been revoked.",
      });
    }
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: async ({ invitationId }: { invitationId: string }) => {
      const { error } = await supabase
        .from('admin_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] });
      logAdminActivity('admin_invitation_cancelled', 'invitation', variables.invitationId);
      toast({
        title: "Invitation cancelled",
        description: "Admin invitation has been cancelled.",
      });
    }
  });

  return {
    adminUsers: adminUsersQuery.data || [],
    invitations: invitationsQuery.data || [],
    isLoading: adminUsersQuery.isLoading || invitationsQuery.isLoading,
    inviteAdmin: inviteAdminMutation.mutate,
    updateAdminRole: updateAdminRoleMutation.mutate,
    removeAdmin: removeAdminMutation.mutate,
    cancelInvitation: cancelInvitationMutation.mutate,
    refetch: () => {
      adminUsersQuery.refetch();
      invitationsQuery.refetch();
    }
  };
};
