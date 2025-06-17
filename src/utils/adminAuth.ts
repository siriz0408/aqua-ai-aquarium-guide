
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

    // Query the profiles table directly to avoid recursion issues
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { isAdmin: false, profile: null };
    }

    console.log('Profile data:', profileData);

    // If user is admin, return the profile with admin status
    if (profileData?.is_admin) {
      return { 
        isAdmin: true, 
        profile: profileData
      };
    }

    return { isAdmin: false, profile: profileData };
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    return { isAdmin: false, profile: null };
  }
};
