
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { useGBIFImport, ImportJob } from '@/hooks/useGBIFImport';
import { formatDistanceToNow } from 'date-fns';

const ImportJobStatus: React.FC = () => {
  const { importJobs, jobsLoading } = useGBIFImport();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getJobTypeLabel = (jobType: string) => {
    switch (jobType) {
      case 'single_species':
        return 'Single Species';
      case 'bulk_import':
        return 'Bulk Import';
      case 'family_import':
        return 'Family Import';
      default:
        return jobType;
    }
  };

  const calculateProgress = (job: ImportJob) => {
    if (job.total_species === 0) return 0;
    return ((job.imported_species + job.failed_species) / job.total_species) * 100;
  };

  if (jobsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-4 w-4 animate-spin mr-2" />
            Loading import jobs...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (importJobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>No import jobs found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Start importing species from GBIF to see your import history here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import History</CardTitle>
        <CardDescription>Track your GBIF import jobs and their progress</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {importJobs.map((job) => (
              <Card key={job.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job.status)}
                    <div>
                      <h4 className="font-medium">{getJobTypeLabel(job.job_type)}</h4>
                      {job.search_query && (
                        <p className="text-sm text-muted-foreground">
                          Query: {job.search_query}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>

                {job.total_species > 0 && (
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {job.imported_species + job.failed_species} / {job.total_species}
                      </span>
                    </div>
                    <Progress value={calculateProgress(job)} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>✅ {job.imported_species} imported</span>
                      {job.failed_species > 0 && (
                        <span>❌ {job.failed_species} failed</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </span>
                  
                  {job.error_details && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        console.log('Job errors:', job.error_details);
                        // Could show a detailed error dialog here
                      }}
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      View Errors
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ImportJobStatus;
