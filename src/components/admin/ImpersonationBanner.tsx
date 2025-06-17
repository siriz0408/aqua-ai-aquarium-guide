
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserX, AlertTriangle } from 'lucide-react';
import { useUserImpersonation } from '@/hooks/useUserImpersonation';

export const ImpersonationBanner: React.FC = () => {
  const { stopImpersonation, checkImpersonationStatus } = useUserImpersonation();
  const [impersonatedUser, setImpersonatedUser] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const active = checkImpersonationStatus();
    setIsActive(active);
    
    if (active) {
      const userData = localStorage.getItem('impersonated_user');
      if (userData) {
        setImpersonatedUser(JSON.parse(userData));
      }
    }
  }, [checkImpersonationStatus]);

  if (!isActive || !impersonatedUser) {
    return null;
  }

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <div className="font-medium text-orange-900">
                Admin Impersonation Active
              </div>
              <div className="text-sm text-orange-700">
                You are viewing the application as: <strong>{impersonatedUser.email}</strong> ({impersonatedUser.full_name})
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={stopImpersonation}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <UserX className="h-4 w-4 mr-2" />
            Stop Impersonation
          </Button>
        </div>
      </div>
    </Card>
  );
};
