
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminStatus = () => {
  const { user } = useAuth();
  const [isAdmin] = useState(false); // Always false in simplified version

  useEffect(() => {
    // No admin checking needed in simplified version
  }, [user]);

  return isAdmin;
};
