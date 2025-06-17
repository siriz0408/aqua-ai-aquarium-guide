
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCredits } from '@/hooks/useCredits';
import { Settings } from 'lucide-react';

export const AdminFooterButton: React.FC = () => {
  const navigate = useNavigate();
  const { profile, profileLoading } = useCredits();

  // Don't show anything while loading or if not admin
  if (profileLoading || !profile?.is_admin) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate('/admin')}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      <Settings className="h-4 w-4 mr-2" />
      Admin
    </Button>
  );
};
