
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 sm:h-14 md:h-16 items-center px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className={cn(
                "h-8 w-8 p-0 flex-shrink-0",
                isTouch && "min-h-[40px] min-w-[40px]"
              )}
            >
              <ArrowUp className="h-4 w-4 rotate-[-90deg]" />
            </Button>
          )}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full ocean-gradient flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs sm:text-sm">🐠</span>
            </div>
            <h1 className={cn(
              "font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate",
              isMobile ? "text-base" : "text-lg sm:text-xl"
            )}>
              {title}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {actions}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className={cn(
                "h-8 w-8 p-0",
                isTouch && "min-h-[40px] min-w-[40px]"
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
              "h-8 w-8 p-0 text-lg",
              isTouch && "min-h-[40px] min-w-[40px]"
            )}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className={cn(
              "h-8 w-8 p-0",
              isTouch && "min-h-[40px] min-w-[40px]"
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
