
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Crown, Zap } from 'lucide-react';

interface FeatureTooltipProps {
  title: string;
  description: string;
  isPremium?: boolean;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export const FeatureTooltip: React.FC<FeatureTooltipProps> = ({
  title,
  description,
  isPremium = false,
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
            <div className="flex items-center gap-2">
              <span className="font-semibold">{title}</span>
              {isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
            </div>
            <div className="text-sm text-muted-foreground">{description}</div>
            {isPremium && (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <Zap className="h-3 w-3" />
                Premium Feature
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
</FeatureTooltip>
