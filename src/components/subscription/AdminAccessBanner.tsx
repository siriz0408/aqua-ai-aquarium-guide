
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

export const AdminAccessBanner: React.FC = () => {
  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">
                Admin Access
              </h3>
              <p className="text-sm text-green-600">
                All features and premium functionality are available
              </p>
            </div>
          </div>
          <Badge className="bg-green-600">
            Admin
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
