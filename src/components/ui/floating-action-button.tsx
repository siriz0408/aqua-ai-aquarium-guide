
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  children,
  className
}) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        // Ensure minimum 48x48px touch target, but make it larger for better UX
        "h-14 w-14 min-h-[48px] min-w-[48px]",
        "sm:bottom-6 sm:right-6 sm:h-16 sm:w-16",
        // Better touch feedback
        "touch-manipulation active:scale-95 transition-transform duration-100",
        className
      )}
      size="lg"
    >
      {children}
    </Button>
  );
};
