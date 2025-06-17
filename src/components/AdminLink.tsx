
import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export const AdminLink = () => {
  const { isAdmin, loading } = useAdminAuth();

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <Button variant="outline" size="sm" asChild className="fixed bottom-4 right-4 z-50">
      <Link to="/admin">
        <Shield className="w-4 h-4 mr-2" />
        Admin Panel
      </Link>
    </Button>
  );
};
