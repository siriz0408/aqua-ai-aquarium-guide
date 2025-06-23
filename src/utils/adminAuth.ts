
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

    // Use the safe function to check admin status
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('check_user_admin_status', { user_id: user.id });

    if (adminError) {
      console.error('Error checking admin status:', adminError);
      return { isAdmin: false, profile: null };
    }

    console.log('Admin check result:', isAdmin);

    // If user is admin, create a minimal profile from auth user data
    if (isAdmin) {
      const minimalProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
        is_admin: true,
        admin_role: 'admin', // Default admin role
        subscription_status: 'active',
        subscription_tier: 'pro',
        admin_permissions: ['user_management', 'ticket_management', 'analytics', 'settings']
      };

      console.log('Admin status check result:', { isAdmin, profile: minimalProfile });

      return { 
        isAdmin: true, 
        profile: minimalProfile
      };
    }

    return { isAdmin: false, profile: null };
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    return { isAdmin: false, profile: null };
  }
};
