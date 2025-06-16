
import React from 'react';

const PlanGenerationLoading: React.FC = () => {
  return (
    <div className="text-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="text-lg font-medium">Generating Your Custom Plan...</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Analyzing your specifications and creating personalized recommendations
      </p>
    </div>
  );
};

export default PlanGenerationLoading;
