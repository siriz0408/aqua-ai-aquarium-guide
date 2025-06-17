
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminFooterButton } from '@/components/AdminFooterButton';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  loading?: boolean;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  subtitle,
  loading = false,
  showBackButton = false,
  backButtonText = 'Back',
  backButtonPath = '/',
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (backButtonPath) {
      navigate(backButtonPath);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900">
      <div className="container mx-auto px-4 py-8">
        <ImpersonationBanner />
        
        <div className="mb-8">
          {showBackButton && (
            <Button
              variant="ghost"
              onClick={handleBackClick}
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {backButtonText}
            </Button>
          )}
          <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
          {subtitle && <p className="text-xl text-muted-foreground">{subtitle}</p>}
        </div>

        <main className="space-y-6">
          {children}
        </main>

        <footer className="mt-12 pt-8 border-t border-border flex justify-center">
          <AdminFooterButton />
        </footer>
      </div>
    </div>
  );
};
