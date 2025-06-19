
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface ParameterTooltipProps {
  parameter: string;
  normalRange: string;
  description: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export const ParameterTooltip: React.FC<ParameterTooltipProps> = ({
  parameter,
  normalRange,
  description,
  children,
  showIcon = true
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children ? (
            <span className="cursor-help">{children}</span>
          ) : (
            <button className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
              {showIcon && <HelpCircle className="h-4 w-4" />}
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3">
          <div className="space-y-2">
            <div className="font-semibold">{parameter}</div>
            <div className="text-sm">
              <span className="font-medium">Normal Range:</span> {normalRange}
            </div>
            <div className="text-sm text-muted-foreground">{description}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
