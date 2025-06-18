
import { supabase } from '@/integrations/supabase/client';
import type { TrialStatus } from '@/types/subscription';

export const fetchTrialStatus = async (userId: string, isAdmin: boolean): Promise<TrialStatus | null> => {
  if (!userId || isAdmin) return null;
  
  const { data, error } = await supabase
    .rpc('check_user_trial_status', { user_id: userId });
  
  if (error) {
    console.error('Error fetching trial status:', error);
    return null;
  }
  
  return data && data.length > 0 ? data[0] : null;
};
