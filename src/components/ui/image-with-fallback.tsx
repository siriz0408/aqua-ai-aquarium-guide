
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  webpSrc?: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  webpSrc,
  alt,
  className,
  skeletonClassName,
  lazy = true,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, isInView]);

  // Determine the best source to use
  useEffect(() => {
    if (!isInView) return;

    const determineSource = async () => {
      // Check if WebP is supported and webpSrc is provided
      if (webpSrc && supportsWebP()) {
        try {
          await preloadImage(webpSrc);
          setCurrentSrc(webpSrc);
          return;
        } catch {
          // Fall through to regular src
        }
      }

      // Try the main src
      try {
        await preloadImage(src);
        setCurrentSrc(src);
      } catch {
        // Try fallback if main src fails
        if (fallbackSrc) {
          try {
            await preloadImage(fallbackSrc);
            setCurrentSrc(fallbackSrc);
          } catch {
            setHasError(true);
          }
        } else {
          setHasError(true);
        }
      }
    };

    determineSource();
  }, [isInView, src, webpSrc, fallbackSrc]);

  const supportsWebP = (): boolean => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch {
      return false;
    }
  };

  const preloadImage = (imageSrc: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = imageSrc;
    });
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  // Show skeleton while not in view or loading
  if (!isInView || (isLoading && currentSrc)) {
    return (
      <div ref={imgRef} className={cn('relative', className)}>
        <Skeleton className={cn('w-full h-full', skeletonClassName)} />
      </div>
    );
  }

  // Show error state
  if (hasError || !currentSrc) {
    return (
      <div 
        ref={imgRef}
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground text-sm',
          className
        )}
        {...props}
      >
        <span>Failed to load image</span>
      </div>
    );
  }

  return (
    <div ref={imgRef} className="relative">
      {isLoading && (
        <Skeleton className={cn('absolute inset-0 w-full h-full', skeletonClassName)} />
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
    </div>
  );
};
