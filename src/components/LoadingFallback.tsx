
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export const LoadingFallback: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
};
