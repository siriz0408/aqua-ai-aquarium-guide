
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
          "py-1 sm:py-2"
        )}>
          {navItems.map(({ path, icon: Icon, label, pattern }) => (
            <Button
              key={path}
              variant={isActive(path, pattern) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col gap-0.5 text-xs min-w-0 px-2 sm:px-3",
                // Ensure minimum 48x48px touch target
                "min-h-[48px] min-w-[48px] h-12 sm:h-14",
                // Better touch feedback
                "touch-manipulation active:scale-95 transition-transform duration-100"
              )}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <span className="truncate leading-none text-[10px] sm:text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
