
import { supabase } from '@/integrations/supabase/client';

export const checkAdminStatus = async () => {
  try {
    console.log('Checking admin status...');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user found');
      return { isAdmin: false, profile: null };
    }

    console.log('User found, checking admin status for:', user.id);

    // Direct query to check admin status without using RLS policies that might cause recursion
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, is_admin, admin_role, subscription_status, subscription_tier')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return { isAdmin: false, profile: null };
    }

    if (!profile) {
      console.log('No profile found for user');
      return { isAdmin: false, profile: null };
    }

    const isAdmin = profile.is_admin || false;
    console.log('Admin status check result:', { isAdmin, profile });

    return { 
      isAdmin, 
      profile: {
        ...profile,
        full_name: profile.full_name || user.email,
      }
    };
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    return { isAdmin: false, profile: null };
  }
};
