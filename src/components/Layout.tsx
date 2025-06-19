
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useDevice } from '@/hooks/use-device';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { Header } from '@/components/layout/Header';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { BreadcrumbNavigation } from '@/components/navigation/BreadcrumbNavigation';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  actions?: React.ReactNode;
  loading?: boolean;
}

export function Layout({ children, title, showBackButton = false, actions, loading = false }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useDevice();
  const isAdmin = useAdminStatus();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Don't show breadcrumbs on auth page or root page
  const showBreadcrumbs = user && location.pathname !== '/' && location.pathname !== '/auth';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OfflineIndicator />

      <Header
        title={title}
        showBackButton={showBackButton}
        actions={actions}
        isAdmin={isAdmin}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSignOut={handleSignOut}
      />

      {showBreadcrumbs && <BreadcrumbNavigation />}

      <main className={cn(
        "flex-1 container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6",
        isMobile ? "pb-20" : "pb-16"
      )}>
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        ) : (
          children
        )}
      </main>

      {user && <BottomNavigation />}
    </div>
  );
}
