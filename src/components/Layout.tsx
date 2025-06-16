
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowUp, MessageCircle, Plus, Save, LogOut, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useDevice } from '@/hooks/use-device';
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
  const { isMobile, isTouch } = useDevice();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Header - Optimized for mobile */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className={cn(
                  "h-8 w-8 p-0 flex-shrink-0",
                  isTouch && "min-h-[44px] min-w-[44px]"
                )}
              >
                <ArrowUp className="h-4 w-4 rotate-[-90deg]" />
              </Button>
            )}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full ocean-gradient flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">🐠</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate">
                {title}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {actions}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className={cn(
                "h-8 w-8 p-0",
                isTouch && "min-h-[44px] min-w-[44px]"
              )}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className={cn(
                  "h-8 w-8 p-0",
                  isTouch && "min-h-[44px] min-w-[44px]"
                )}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content with better mobile spacing */}
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        ) : (
          children
        )}
      </main>

      {/* Bottom Navigation - Enhanced for mobile */}
      {user && (
        <nav className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/40 supports-[backdrop-filter]:bg-background/60 safe-area-inset-bottom">
          <div className="container px-2 sm:px-4">
            <div className="flex items-center justify-around py-1 sm:py-2">
              <Button
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/')}
                className={cn(
                  "flex flex-col gap-0.5 sm:gap-1 h-10 sm:h-12 text-xs min-w-0 px-2 sm:px-3",
                  isTouch && "min-h-[44px]"
                )}
              >
                <Home className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Home</span>
              </Button>
              
              <Button
                variant={location.pathname === '/aquabot' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/aquabot')}
                className={cn(
                  "flex flex-col gap-0.5 sm:gap-1 h-10 sm:h-12 text-xs min-w-0 px-2 sm:px-3",
                  isTouch && "min-h-[44px]"
                )}
              >
                <MessageCircle className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">AquaBot</span>
              </Button>
              
              <Button
                variant={location.pathname === '/setup-planner' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/setup-planner')}
                className={cn(
                  "flex flex-col gap-0.5 sm:gap-1 h-10 sm:h-12 text-xs min-w-0 px-2 sm:px-3",
                  isTouch && "min-h-[44px]"
                )}
              >
                <Plus className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Planner</span>
              </Button>
              
              <Button
                variant={location.pathname === '/reminders' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/reminders')}
                className={cn(
                  "flex flex-col gap-0.5 sm:gap-1 h-10 sm:h-12 text-xs min-w-0 px-2 sm:px-3",
                  isTouch && "min-h-[44px]"
                )}
              >
                <Save className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Tasks</span>
              </Button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
