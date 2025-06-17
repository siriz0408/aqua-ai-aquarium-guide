
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  admin_role: string | null;
}

interface ImpersonationResult {
  user_data: UserData;
}

export const useUserImpersonation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isImpersonating, setIsImpersonating] = useState(false);

  const impersonateUserMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) {
        throw new Error('Admin user not authenticated');
      }

      console.log('Starting impersonation for user:', targetUserId);

      // Call the admin_impersonate_user function
      const { data, error } = await supabase.rpc('admin_impersonate_user', {
        requesting_admin_id: user.id,
        target_user_id: targetUserId
      });

      if (error) {
        console.error('Impersonation error:', error);
        throw error;
      }

      console.log('Impersonation data:', data);
      
      // Since the function returns an array, get the first element and ensure proper typing
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No impersonation data returned');
      }

      const result = data[0];
      if (!result || typeof result.user_data !== 'object') {
        throw new Error('Invalid user data format');
      }

      return result as ImpersonationResult;
    },
    onSuccess: async (data) => {
      console.log('Impersonation successful:', data);
      
      // Store the original admin session info
      const originalSession = await supabase.auth.getSession();
      if (originalSession.data.session) {
        localStorage.setItem('admin_original_session', JSON.stringify({
          user_id: originalSession.data.session.user.id,
          email: originalSession.data.session.user.email
        }));
      }

      // Store impersonation info
      localStorage.setItem('impersonation_active', 'true');
      localStorage.setItem('impersonated_user', JSON.stringify(data.user_data));

      setIsImpersonating(true);
      
      toast({
        title: "Impersonation started",
        description: `You are now logged in as ${data.user_data.email}`,
        variant: "default",
      });

      // Redirect to main dashboard to see the user's view
      window.location.href = '/';
    },
    onError: (error: any) => {
      console.error('Impersonation failed:', error);
      toast({
        title: "Impersonation failed",
        description: error.message || 'Unable to impersonate user',
        variant: "destructive",
      });
    },
  });

  const stopImpersonation = () => {
    console.log('Stopping impersonation...');
    
    // Clear impersonation data
    localStorage.removeItem('impersonation_active');
    localStorage.removeItem('impersonated_user');
    localStorage.removeItem('admin_original_session');
    
    setIsImpersonating(false);
    
    toast({
      title: "Impersonation ended",
      description: "You are back to your admin account",
    });

    // Redirect back to admin panel
    window.location.href = '/admin';
  };

  // Check if currently impersonating on mount
  const checkImpersonationStatus = () => {
    const isActive = localStorage.getItem('impersonation_active') === 'true';
    setIsImpersonating(isActive);
    return isActive;
  };

  return {
    impersonateUser: impersonateUserMutation.mutate,
    stopImpersonation,
    isImpersonating,
    checkImpersonationStatus,
    isPending: impersonateUserMutation.isPending,
  };
};
