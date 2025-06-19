
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, InfoIcon } from 'lucide-react';

interface SyncOperationResultProps {
  result: any;
}

export const SyncOperationResult: React.FC<SyncOperationResultProps> = ({ result }) => {
  if (!result) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          Operation Result
        </CardTitle>
        <CardDescription>
          Result of the last sync operation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result.success ? (
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Success:</strong> {result.message}
              </AlertDescription>
            </Alert>
            
            {result.details && (
              <div className="text-sm">
                <h4 className="font-medium mb-2">Details:</h4>
                <div className="space-y-1 text-muted-foreground">
                  {result.details.user_id && (
                    <p><strong>User ID:</strong> {result.details.user_id}</p>
                  )}
                  {result.details.email && (
                    <p><strong>Email:</strong> {result.details.email}</p>
                  )}
                  {result.details.status_updated && (
                    <p><strong>Status:</strong> {result.details.status_updated}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {result.message}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Timestamp: {new Date().toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};
