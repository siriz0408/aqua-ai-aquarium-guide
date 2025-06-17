
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
      // Fallback to direct profile query
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, is_admin, admin_role, admin_permissions, email, full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return { isAdmin: false, profile: null };
      }

      console.log('Profile data (fallback):', profile);
      return { 
        isAdmin: profile?.is_admin || false, 
        profile 
      };
    }

    // If RPC call succeeded, get the full profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, is_admin, admin_role, admin_permissions, email, full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile after admin check:', profileError);
      return { isAdmin: adminCheck, profile: null };
    }

    console.log('Admin check result:', adminCheck);
    console.log('Profile data:', profile);

    return { 
      isAdmin: adminCheck || false, 
      profile 
    };
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    return { isAdmin: false, profile: null };
  }
};
