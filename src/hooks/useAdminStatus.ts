
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdminStatus = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .rpc('check_user_admin_status', { user_id: user.id });
        
        if (!error && data) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return isAdmin;
};
