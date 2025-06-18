
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface SyncOperationResultProps {
  result: {
    success: boolean;
    message: string;
    details?: any;
  } | null;
}

export const SyncOperationResult: React.FC<SyncOperationResultProps> = ({ result }) => {
  if (!result) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          Last Operation Result
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={result.success ? "default" : "destructive"}>
              {result.success ? "Success" : "Failed"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {result.message}
            </span>
          </div>
          
          {result.details && (
            <div className="mt-4">
              <Label className="text-sm font-medium">Operation Details:</Label>
              <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-40">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
