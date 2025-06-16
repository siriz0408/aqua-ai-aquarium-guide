
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowUp, Chat, Plus, Save, Upload } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  actions?: React.ReactNode;
}

export function Layout({ children, title, showBackButton = false, actions }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-8 w-8 p-0"
              >
                <ArrowUp className="h-4 w-4 rotate-[-90deg]" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full ocean-gradient flex items-center justify-center">
                <span className="text-white font-bold text-sm">🐠</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {title}
              </h1>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            {actions}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/40 supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4">
          <div className="flex items-center justify-around py-2">
            <Button
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/')}
              className="flex flex-col gap-1 h-12 text-xs"
            >
              <div className="h-5 w-5 rounded-full ocean-gradient flex items-center justify-center">
                <span className="text-white text-xs">🏠</span>
              </div>
              Home
            </Button>
            
            <Button
              variant={location.pathname === '/aquabot' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/aquabot')}
              className="flex flex-col gap-1 h-12 text-xs"
            >
              <Chat className="h-4 w-4" />
              AquaBot
            </Button>
            
            <Button
              variant={location.pathname === '/setup-planner' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/setup-planner')}
              className="flex flex-col gap-1 h-12 text-xs"
            >
              <Plus className="h-4 w-4" />
              Planner
            </Button>
            
            <Button
              variant={location.pathname === '/reminders' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/reminders')}
              className="flex flex-col gap-1 h-12 text-xs"
            >
              <Save className="h-4 w-4" />
              Reminders
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
