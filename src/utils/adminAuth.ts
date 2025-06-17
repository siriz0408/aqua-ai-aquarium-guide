
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

    // Query the profiles table directly with better error handling
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(); // Fixed: removed duplicate .single() call

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { isAdmin: false, profile: null };
    }

    if (!profileData) {
      console.log('No profile found for user');
      return { isAdmin: false, profile: null };
    }

    console.log('Profile data:', profileData);

    // Check admin status with explicit boolean check
    const isAdmin = Boolean(profileData.is_admin);
    
    return { 
      isAdmin, 
      profile: profileData
    };
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    return { isAdmin: false, profile: null };
  }
};
