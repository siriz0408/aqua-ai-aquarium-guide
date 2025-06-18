
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
      <div className="container px-1 sm:px-2">
        <div className={cn(
          "flex items-center justify-around",
          isMobile ? "py-1" : "py-2"
        )}>
          {navItems.map(({ path, icon: Icon, label, pattern }) => (
            <Button
              key={path}
              variant={isActive(path, pattern) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col gap-0.5 text-xs min-w-0 px-1 sm:px-2",
                isMobile ? "h-12 min-h-[48px]" : "h-10 sm:h-12",
                isTouch && "min-h-[44px]"
              )}
            >
              <Icon className={cn(
                "flex-shrink-0",
                isMobile ? "h-5 w-5" : "h-4 w-4"
              )} />
              <span className="truncate leading-none">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
