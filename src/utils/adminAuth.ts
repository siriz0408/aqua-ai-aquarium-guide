
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

    // Use the new safe function to check admin status
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('check_user_admin_status', { user_id: user.id });

    if (adminError) {
      console.error('Error checking admin status:', adminError);
      return { isAdmin: false, profile: null };
    }

    console.log('Admin check result:', isAdmin);

    // If user is admin, get their full profile
    if (isAdmin) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, is_admin, admin_role, subscription_status, subscription_tier, admin_permissions')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching admin profile:', profileError);
        return { isAdmin: false, profile: null };
      }

      console.log('Admin status check result:', { isAdmin, profile });

      return { 
        isAdmin: true, 
        profile: {
          ...profile,
          full_name: profile.full_name || user.email,
        }
      };
    }

    return { isAdmin: false, profile: null };
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    return { isAdmin: false, profile: null };
  }
};
