
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Settings, 
  HelpCircle, 
  CreditCard,
  Shield,
  Fish,
  Waves,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { Badge } from './ui/badge';

interface SidebarProps {
  onItemClick?: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth: boolean;
  requiresPro?: boolean;
  adminOnly?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: Home, requiresAuth: true },
  { name: 'Aquariums', href: '/aquariums', icon: Fish, requiresAuth: true, requiresPro: false },
  { name: 'Water Testing', href: '/water-testing', icon: Waves, requiresAuth: true, requiresPro: true },
  { name: 'Maintenance', href: '/maintenance', icon: Calendar, requiresAuth: true, requiresPro: false },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, requiresAuth: true, requiresPro: true },
  { name: 'Subscription', href: '/subscription', icon: CreditCard, requiresAuth: true },
  { name: 'Settings', href: '/settings', icon: Settings, requiresAuth: true },
  { name: 'Support', href: '/support', icon: HelpCircle, requiresAuth: true },
];

const adminNavigation: NavigationItem[] = [
  { name: 'Admin Panel', href: '/admin', icon: Shield, requiresAuth: true, adminOnly: true },
];

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const location = useLocation();
  const { hasAccess, isAdmin } = useSubscriptionAccess();

  const allNavigation = [
    ...navigation,
    ...(isAdmin ? adminNavigation : [])
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center gap-2">
          <Fish className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">AquaAI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {allNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          const isDisabled = item.requiresPro && !hasAccess && !isAdmin;
          const showAdminOnly = item.adminOnly && !isAdmin;

          if (showAdminOnly) return null;

          return (
            <Link
              key={item.name}
              to={isDisabled ? '#' : item.href}
              onClick={isDisabled ? (e) => e.preventDefault() : onItemClick}
              className={cn(
                'group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : isDisabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon 
                  className={cn(
                    'h-5 w-5',
                    isActive ? 'text-blue-700' : isDisabled ? 'text-gray-400' : 'text-gray-400'
                  )} 
                />
                <span>{item.name}</span>
              </div>
              
              {item.requiresPro && !hasAccess && !isAdmin && (
                <Badge variant="secondary" className="text-xs">
                  Pro
                </Badge>
              )}
              
              {item.adminOnly && (
                <Badge variant="destructive" className="text-xs">
                  Admin
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-gray-500 space-y-1">
          <p>AquaAI v1.0</p>
          <p>© 2024 AquaAI</p>
        </div>
      </div>
    </div>
  );
};
