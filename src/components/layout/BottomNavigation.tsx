
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, MessageCircle, Plus, Save, Fish, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDevice } from '@/hooks/use-device';
import { cn } from '@/lib/utils';

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTouch } = useDevice();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/aquabot', icon: MessageCircle, label: 'AquaBot' },
    { path: '/setup-planner', icon: Plus, label: 'Planner' },
    { path: '/reminders', icon: Save, label: 'Tasks' },
    { path: '/tanks', icon: Fish, label: 'Tanks', pattern: '/tank/' },
    { path: '/education', icon: BookOpen, label: 'Learn' }
  ];

  const isActive = (path: string, pattern?: string) => {
    return location.pathname === path || (pattern && location.pathname.startsWith(pattern));
  };

  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/40 supports-[backdrop-filter]:bg-background/60 safe-area-inset-bottom">
      <div className="w-full max-w-full px-2 sm:px-4">
        <div className={cn(
          "flex items-center justify-around w-full",
          // Mobile-first responsive padding
          "py-2",
          "sm:py-3"
        )}>
          {navItems.map(({ path, icon: Icon, label, pattern }) => (
            <Button
              key={path}
              variant={isActive(path, pattern) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs min-w-0 flex-1 max-w-[80px]",
                // Ensure proper touch targets
                "min-h-[60px] px-1",
                "sm:min-h-[64px] sm:px-2",
                // Better touch feedback
                "touch-manipulation active:scale-95 transition-transform duration-100",
                // Responsive text and icon sizing
                "text-[10px] leading-none",
                "sm:text-xs"
              )}
            >
              <Icon className={cn(
                "flex-shrink-0",
                "h-5 w-5",
                "sm:h-6 sm:w-6"
              )} />
              <span className="truncate w-full text-center">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
