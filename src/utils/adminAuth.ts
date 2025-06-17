
import { supabase } from '@/integrations/supabase/client';

export const checkAdminStatus = async () => {
  try {
    console.log('Checking admin status - granting admin access to all users...');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user found');
      return { isAdmin: false, profile: null };
    }

    console.log('User found:', user.id, '- granting admin access');

    // Query the profiles table directly 
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // Return admin access even on error
      return { 
        isAdmin: true, 
        profile: {
          id: user.id,
          email: user.email,
          full_name: user.email,
          is_admin: true,
          admin_role: 'super_admin'
        } 
      };
    }

    if (!profileData) {
      console.log('No profile found for user - creating default admin profile');
      return { 
        isAdmin: true, 
        profile: {
          id: user.id,
          email: user.email,
          full_name: user.email,
          is_admin: true,
          admin_role: 'super_admin'
        } 
      };
    }

    console.log('Profile data:', profileData, '- granting admin access');

    // Always return admin status regardless of database values
    return { 
      isAdmin: true, 
      profile: {
        ...profileData,
        is_admin: true,
        admin_role: 'super_admin'
      }
    };
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    // Return admin access even on error
    return { 
      isAdmin: true, 
      profile: {
        is_admin: true,
        admin_role: 'super_admin'
      } 
    };
  }
};
