
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminFooterButton } from '@/components/AdminFooterButton';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';
import { useAuth } from '@/contexts/AuthContext';
import { checkAdminStatus } from '@/utils/adminAuth';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  loading?: boolean;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
  actions?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  subtitle,
  loading = false,
  showBackButton = false,
  backButtonText = 'Back',
  backButtonPath = '/',
  actions,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const { isAdmin: adminStatus } = await checkAdminStatus();
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  const handleBackClick = () => {
    if (backButtonPath) {
      navigate(backButtonPath);
    } else {
      navigate(-1);
    }
  };

  const handleAdminClick = () => {
    navigate('/admin');
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  onClick={handleBackClick}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {backButtonText}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAdminClick}
                  className="text-muted-foreground hover:text-foreground"
                  title="Admin Dashboard"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              {actions && (
                <>
                  {actions}
                </>
              )}
            </div>
          </div>
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
