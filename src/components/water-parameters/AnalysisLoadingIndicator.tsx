
import React from 'react';

interface AnalysisLoadingIndicatorProps {
  isLoading: boolean;
}

export const AnalysisLoadingIndicator: React.FC<AnalysisLoadingIndicatorProps> = ({
  isLoading
}) => {
  if (!isLoading) return null;

  return (
    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm">AI is analyzing your water parameters...</span>
      </div>
    </div>
  );
};
