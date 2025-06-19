
import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

export const useBreadcrumbs = () => {
  const location = useLocation();
  const params = useParams();
  const { user } = useAuth();

  // Fetch tank data if we have a tankId
  const { data: tank } = useQuery({
    queryKey: ['tank', params.tankId],
    queryFn: async () => {
      if (!params.tankId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('tanks')
        .select('name')
        .eq('id', params.tankId)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching tank:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!params.tankId && !!user?.id,
  });

  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [];

    // Always start with Home
    if (pathSegments.length > 0) {
      breadcrumbItems.push({
        label: 'Home',
        href: '/',
      });
    }

    // Handle different routes
    if (pathSegments.includes('tanks')) {
      if (pathSegments.length === 1) {
        // Just /tanks
        breadcrumbItems.push({
          label: 'Tanks',
          isCurrentPage: true,
        });
      } else {
        // Tanks overview
        breadcrumbItems.push({
          label: 'Tanks',
          href: '/tanks',
        });
      }
    }

    if (pathSegments.includes('add-tank')) {
      breadcrumbItems.push({
        label: 'Add Tank',
        isCurrentPage: true,
      });
    }

    if (params.tankId && tank) {
      const tankName = tank.name || 'Tank';
      const isOnTankDetails = pathSegments.length === 2 && pathSegments[0] === 'tank';
      
      breadcrumbItems.push({
        label: tankName,
        href: isOnTankDetails ? undefined : `/tank/${params.tankId}`,
        isCurrentPage: isOnTankDetails,
      });

      // Handle tank sub-pages
      if (pathSegments.includes('edit')) {
        breadcrumbItems.push({
          label: 'Edit',
          isCurrentPage: true,
        });
      }

      if (pathSegments.includes('log-parameters')) {
        breadcrumbItems.push({
          label: 'Log Parameters',
          isCurrentPage: true,
        });
      }

      if (pathSegments.includes('equipment')) {
        breadcrumbItems.push({
          label: 'Equipment',
          isCurrentPage: true,
        });
      }

      if (pathSegments.includes('livestock')) {
        breadcrumbItems.push({
          label: 'Livestock',
          isCurrentPage: true,
        });
      }
    }

    // Handle other main routes
    if (pathSegments.includes('setup-planner')) {
      breadcrumbItems.push({
        label: 'Setup Planner',
        isCurrentPage: true,
      });
    }

    if (pathSegments.includes('aquabot')) {
      breadcrumbItems.push({
        label: 'AquaBot',
        isCurrentPage: true,
      });
    }

    if (pathSegments.includes('reminders')) {
      breadcrumbItems.push({
        label: 'Reminders',
        isCurrentPage: true,
      });
    }

    if (pathSegments.includes('education')) {
      breadcrumbItems.push({
        label: 'Education',
        isCurrentPage: true,
      });
    }

    if (pathSegments.includes('account')) {
      breadcrumbItems.push({
        label: 'Account',
        isCurrentPage: true,
      });
    }

    if (pathSegments.includes('pricing')) {
      breadcrumbItems.push({
        label: 'Pricing',
        isCurrentPage: true,
      });
    }

    if (pathSegments.includes('admin')) {
      breadcrumbItems.push({
        label: 'Admin',
        isCurrentPage: true,
      });
    }

    return breadcrumbItems;
  }, [location.pathname, params.tankId, tank]);

  return breadcrumbs;
};
