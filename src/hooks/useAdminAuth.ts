
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminProfile {
  id: string;
  is_admin: boolean;
  admin_role: string | null;
  admin_permissions: any;
}

export const useAdminAuth = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setAdminProfile(null);
      setLoading(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, is_admin, admin_role, admin_permissions')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setAdminProfile(data);
      setIsAdmin(data?.is_admin || false);
      
      // Update last admin login if user is admin
      if (data?.is_admin) {
        await supabase
          .from('profiles')
          .update({ last_admin_login: new Date().toISOString() })
          .eq('id', user?.id);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const logAdminActivity = async (action: string, targetType?: string, targetId?: string, details?: any) => {
    if (!isAdmin) return;

    try {
      await supabase.from('admin_activity_logs').insert({
        admin_user_id: user?.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details,
        ip_address: null, // Could be enhanced to capture real IP
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!adminProfile?.admin_permissions) return false;
    return adminProfile.admin_permissions.includes(permission) || adminProfile.admin_role === 'super_admin';
  };

  return {
    isAdmin,
    adminProfile,
    loading,
    logAdminActivity,
    hasPermission,
    checkAdminStatus
  };
};
