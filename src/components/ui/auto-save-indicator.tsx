
import React from 'react';
import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { AutoSaveStatus } from '@/hooks/useAutoSave';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  className
}) => {
  const getStatusConfig = () => {
    switch (status.status) {
      case 'saving':
        return {
          icon: Loader2,
          text: 'Saving...',
          className: 'text-blue-600 animate-spin'
        };
      case 'saved':
        return {
          icon: Check,
          text: 'Saved',
          className: 'text-green-600'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Save failed',
          className: 'text-red-600'
        };
      default:
        return {
          icon: Clock,
          text: 'Auto-save enabled',
          className: 'text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (status.status === 'idle') {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-1 text-xs', className)}>
      <Icon className={cn('h-3 w-3', config.className)} />
      <span className={config.className}>{config.text}</span>
      {status.lastSaved && status.status === 'saved' && (
        <span className="text-muted-foreground ml-1">
          at {status.lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};
