
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowUp, MessageCircle, Plus, Save, LogOut, Home, BookOpen, Fish, Settings } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Mobile-first Header */}
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
            {/* Admin Settings Button */}
            {user && (
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
              onClick={toggleTheme}
              className={cn(
                "h-8 w-8 p-0 text-lg",
                isTouch && "min-h-[40px] min-w-[40px]"
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
                  isTouch && "min-h-[40px] min-w-[40px]"
                )}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Mobile optimized spacing */}
      <main className={cn(
        "flex-1 container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6",
        isMobile ? "pb-20" : "pb-16" // Extra space for bottom nav on mobile
      )}>
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        ) : (
          children
        )}
      </main>

      {/* Mobile-optimized Bottom Navigation */}
      {user && (
        <nav className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/40 supports-[backdrop-filter]:bg-background/60 safe-area-inset-bottom">
          <div className="container px-1 sm:px-2">
            <div className={cn(
              "flex items-center justify-around",
              isMobile ? "py-1" : "py-2"
            )}>
              <Button
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/')}
                className={cn(
                  "flex flex-col gap-0.5 text-xs min-w-0 px-1 sm:px-2",
                  isMobile ? "h-12 min-h-[48px]" : "h-10 sm:h-12",
                  isTouch && "min-h-[44px]"
                )}
              >
                <Home className={cn(
                  "flex-shrink-0",
                  isMobile ? "h-5 w-5" : "h-4 w-4"
                )} />
                <span className="truncate leading-none">Home</span>
              </Button>
              
              <Button
                variant={location.pathname === '/aquabot' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/aquabot')}
                className={cn(
                  "flex flex-col gap-0.5 text-xs min-w-0 px-1 sm:px-2",
                  isMobile ? "h-12 min-h-[48px]" : "h-10 sm:h-12",
                  isTouch && "min-h-[44px]"
                )}
              >
                <MessageCircle className={cn(
                  "flex-shrink-0",
                  isMobile ? "h-5 w-5" : "h-4 w-4"
                )} />
                <span className="truncate leading-none">AquaBot</span>
              </Button>
              
              <Button
                variant={location.pathname === '/setup-planner' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/setup-planner')}
                className={cn(
                  "flex flex-col gap-0.5 text-xs min-w-0 px-1 sm:px-2",
                  isMobile ? "h-12 min-h-[48px]" : "h-10 sm:h-12",
                  isTouch && "min-h-[44px]"
                )}
              >
                <Plus className={cn(
                  "flex-shrink-0",
                  isMobile ? "h-5 w-5" : "h-4 w-4"
                )} />
                <span className="truncate leading-none">Planner</span>
              </Button>
              
              <Button
                variant={location.pathname === '/reminders' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/reminders')}
                className={cn(
                  "flex flex-col gap-0.5 text-xs min-w-0 px-1 sm:px-2",
                  isMobile ? "h-12 min-h-[48px]" : "h-10 sm:h-12",
                  isTouch && "min-h-[44px]"
                )}
              >
                <Save className={cn(
                  "flex-shrink-0",
                  isMobile ? "h-5 w-5" : "h-4 w-4"
                )} />
                <span className="truncate leading-none">Tasks</span>
              </Button>

              <Button
                variant={location.pathname.startsWith('/tank/') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/')}
                className={cn(
                  "flex flex-col gap-0.5 text-xs min-w-0 px-1 sm:px-2",
                  isMobile ? "h-12 min-h-[48px]" : "h-10 sm:h-12",
                  isTouch && "min-h-[44px]"
                )}
              >
                <Fish className={cn(
                  "flex-shrink-0",
                  isMobile ? "h-5 w-5" : "h-4 w-4"
                )} />
                <span className="truncate leading-none">Tanks</span>
              </Button>

              <Button
                variant={location.pathname === '/education' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/education')}
                className={cn(
                  "flex flex-col gap-0.5 text-xs min-w-0 px-1 sm:px-2",
                  isMobile ? "h-12 min-h-[48px]" : "h-10 sm:h-12",
                  isTouch && "min-h-[44px]"
                )}
              >
                <BookOpen className={cn(
                  "flex-shrink-0",
                  isMobile ? "h-5 w-5" : "h-4 w-4"
                )} />
                <span className="truncate leading-none">Learn</span>
              </Button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
