
import { supabase } from '@/integrations/supabase/client';

export const checkAdminStatus = async () => {
  try {
    console.log('Checking admin status...');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user found');
      return { isAdmin: false, profile: null };
    }

    console.log('User found:', user.id);

    // Use the security definer function to check admin status
    const { data: adminCheck, error: adminError } = await supabase
      .rpc('is_admin', { user_id: user.id });

    if (adminError) {
      console.error('Error checking admin status with RPC:', adminError);
      return { isAdmin: false, profile: null };
    }

    console.log('Admin check result:', adminCheck);

    // If user is admin, we can create a basic profile object
    if (adminCheck) {
      const profile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
        is_admin: true,
        admin_role: 'admin',
        admin_permissions: ['user_management', 'ticket_management', 'analytics', 'settings'],
        subscription_status: 'active',
        subscription_tier: 'pro', // Admins get pro tier access
        created_at: user.created_at,
        last_active: new Date().toISOString(),
      };

      return { 
        isAdmin: true, 
        profile 
      };
    }

    return { isAdmin: false, profile: null };
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    return { isAdmin: false, profile: null };
  }
};
