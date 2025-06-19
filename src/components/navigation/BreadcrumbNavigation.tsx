
import React from 'react';
import { Link } from 'react-router-dom';
import { useDevice } from '@/hooks/use-device';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

export const BreadcrumbNavigation: React.FC = () => {
  const breadcrumbs = useBreadcrumbs();
  const { isMobile } = useDevice();

  // Don't show breadcrumbs if we only have the current page or no breadcrumbs
  if (breadcrumbs.length <= 1) {
    return null;
  }

  // On mobile, show only last 2 items with ellipsis if needed
  const displayBreadcrumbs = isMobile && breadcrumbs.length > 2 
    ? [
        breadcrumbs[0], // Keep Home
        { label: '...', isEllipsis: true },
        ...breadcrumbs.slice(-1) // Last item
      ]
    : breadcrumbs;

  return (
    <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            {displayBreadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.isEllipsis ? (
                    <BreadcrumbEllipsis />
                  ) : item.isCurrentPage ? (
                    <BreadcrumbPage className="text-foreground font-medium">
                      {item.label}
                    </BreadcrumbPage>
                  ) : item.href ? (
                    <BreadcrumbLink asChild>
                      <Link 
                        to={item.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <span className="text-muted-foreground">{item.label}</span>
                  )}
                </BreadcrumbItem>
                {index < displayBreadcrumbs.length - 1 && (
                  <BreadcrumbSeparator />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};
