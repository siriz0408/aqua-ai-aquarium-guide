
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDevice } from '@/hooks/use-device';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  actions?: React.ReactNode;
  isAdmin: boolean;
  theme: string;
  onToggleTheme: () => void;
  onSignOut: () => void;
}

export function Header({
  title,
  showBackButton = false,
  actions,
  isAdmin,
  theme,
  onToggleTheme,
  onSignOut
}: HeaderProps) {
  const navigate = useNavigate();
  const { isMobile, isTouch } = useDevice();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-top">
      <div className={cn(
        "flex items-center justify-between w-full max-w-full overflow-hidden",
        // Mobile-first responsive heights and padding
        "h-14 px-4",
        "sm:h-16 sm:px-6",
        "md:px-8",
        "lg:container lg:mx-auto"
      )}>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className={cn(
                "flex-shrink-0 p-2",
                "h-8 w-8",
                "sm:h-9 sm:w-9",
                isTouch && "min-h-[44px] min-w-[44px]"
              )}
            >
              <ArrowUp className="h-4 w-4 rotate-[-90deg]" />
            </Button>
          )}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={cn(
              "rounded-full ocean-gradient flex items-center justify-center flex-shrink-0",
              "h-7 w-7",
              "sm:h-8 sm:w-8"
            )}>
              <span className="text-white font-bold text-sm">🐠</span>
            </div>
            <h1 className={cn(
              "font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate",
              "text-lg leading-tight",
              "sm:text-xl",
              "md:text-2xl"
            )}>
              {title}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {actions && (
            <div className="hidden sm:flex items-center gap-2">
              {actions}
            </div>
          )}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className={cn(
                "p-2",
                "h-8 w-8",
                "sm:h-9 sm:w-9",
                isTouch && "min-h-[44px] min-w-[44px]"
              )}
              title="Admin Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTheme}
            className={cn(
              "p-2 text-lg",
              "h-8 w-8",
              "sm:h-9 sm:w-9",
              isTouch && "min-h-[44px] min-w-[44px]"
            )}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className={cn(
              "p-2",
              "h-8 w-8",
              "sm:h-9 sm:w-9",
              isTouch && "min-h-[44px] min-w-[44px]"
            )}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
