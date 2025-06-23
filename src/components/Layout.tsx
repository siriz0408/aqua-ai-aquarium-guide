
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useDevice } from '@/hooks/use-device';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { BreadcrumbNavigation } from '@/components/navigation/BreadcrumbNavigation';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  actions?: React.ReactNode;
  loading?: boolean;
}

export function Layout({ children, title = "AquaAI", showBackButton = false, actions, loading = false }: LayoutProps) {
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

      <Header />

      {showBreadcrumbs && <BreadcrumbNavigation />}

      <main className={cn(
        "flex-1 w-full max-w-full overflow-x-hidden",
        // Mobile-first padding with responsive adjustments
        "px-4 py-4",
        "sm:px-6 sm:py-6", 
        "md:px-8 md:py-8",
        "lg:container lg:mx-auto",
        // Account for bottom navigation on mobile
        isMobile ? "pb-24" : "pb-20"
      )}>
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        ) : (
          children
        )}
      </main>

      {isMobile && <BottomNavigation />}
    </div>
  );
}
