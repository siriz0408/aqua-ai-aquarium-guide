
import { supabase } from '@/integrations/supabase/client';

export const checkAdminStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { isAdmin: false, profile: null };
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, is_admin, admin_role, admin_permissions')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return { isAdmin: false, profile: null };
    }

    return { 
      isAdmin: profile?.is_admin || false, 
      profile 
    };
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    return { isAdmin: false, profile: null };
  }
};
