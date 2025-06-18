
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface CompatibilityWarningProps {
  livestock: Array<{
    id: string;
    name: string;
    careLevel: string;
  }>;
}

export function CompatibilityWarning({ livestock }: CompatibilityWarningProps) {
  if (livestock.length <= 1) return null;

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Compatibility Check
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Review the compatibility of your livestock selection:
          </p>
          <div className="flex flex-wrap gap-2">
            {livestock.map((animal) => (
              <Badge key={animal.id} variant="secondary" className="text-xs">
                {animal.name} - {animal.careLevel}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
