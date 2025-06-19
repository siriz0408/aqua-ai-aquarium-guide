
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Fish, 
  Droplets, 
  Calculator, 
  BookOpen, 
  MessageCircle,
  Calendar
} from 'lucide-react';

const navigationItems = [
  {
    href: '/',
    icon: Home,
    label: 'Home',
  },
  {
    href: '/tanks',
    icon: Fish,
    label: 'Tanks',
  },
  {
    href: '/log-parameters',
    icon: Droplets,
    label: 'Log',
  },
  {
    href: '/maintenance-scheduler',
    icon: Calendar,
    label: 'Schedule',
  },
  {
    href: '/tools',
    icon: Calculator,
    label: 'Tools',
  },
  {
    href: '/education',
    icon: BookOpen,
    label: 'Learn',
  },
  {
    href: '/aquabot',
    icon: MessageCircle,
    label: 'AquaBot',
  },
];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border sm:hidden">
      <nav className="flex items-center justify-around py-2 px-1">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-colors min-w-0 flex-1",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium truncate leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
