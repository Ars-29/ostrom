import { useState, useEffect, useCallback } from 'react';

interface UseResponsiveImageOptions {
  src: string;
  quality?: 'high' | 'medium' | 'low';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

interface UseResponsiveImageReturn {
  src: string;
  srcset: string;
  isLoaded: boolean;
  hasError: boolean;
  isLoading: boolean;
  loadImage: () => void;
}

/**
 * Hook for intelligent responsive image loading
 * Automatically selects best image format and quality based on device and connection
 */
export const useResponsiveImage = ({
  src,
  quality = 'medium',
  priority = false,
  onLoad,
  onError
}: UseResponsiveImageOptions): UseResponsiveImageReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [srcset, setSrcset] = useState<string>('');

  // Detect device capabilities
  const getDeviceCapabilities = useCallback(() => {
    const isHighDPI = window.devicePixelRatio > 1;
    const isSlowConnection = (navigator as any).connection?.effectiveType === 'slow-2g' || 
                           (navigator as any).connection?.effectiveType === '2g';
    const isMobile = window.innerWidth <= 768;
    
    return {
      isHighDPI,
      isSlowConnection,
      isMobile,
      prefersWebP: document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0,
      prefersAVIF: document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0
    };
  }, []);

  // Determine optimal image source
  const determineOptimalSource = useCallback((baseSrc: string, capabilities: any) => {
    const baseName = baseSrc.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
    
    // Priority order: AVIF > WebP > Original
    if (capabilities.prefersAVIF && !capabilities.isSlowConnection) {
      return {
        src: `/images/compressed/${baseName}_${quality}.avif`,
        srcset: [
          `/images/compressed/${baseName}_high_1920w.avif 1920w`,
          `/images/compressed/${baseName}_medium_1280w.avif 1280w`,
          `/images/compressed/${baseName}_low_640w.avif 640w`
        ].join(', ')
      };
    }
    
    if (capabilities.prefersWebP) {
      return {
        src: `/images/compressed/${baseName}_${quality}.webp`,
        srcset: [
          `/images/compressed/${baseName}_high_1920w.webp 1920w`,
          `/images/compressed/${baseName}_medium_1280w.webp 1280w`,
          `/images/compressed/${baseName}_low_640w.webp 640w`
        ].join(', ')
      };
    }
    
    // Fallback to original
    return {
      src: baseSrc,
      srcset: ''
    };
  }, [quality]);

  // Load image with error handling
  const loadImage = useCallback(() => {
    if (isLoading || isLoaded) return;
    
    setIsLoading(true);
    setHasError(false);
    
    const capabilities = getDeviceCapabilities();
    const optimalSource = determineOptimalSource(src, capabilities);
    
    setCurrentSrc(optimalSource.src);
    setSrcset(optimalSource.srcset);
    
    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      
      // Try fallback to original source
      if (optimalSource.src !== src) {
        console.warn(`⚠️ [useResponsiveImage] Compressed image failed, trying original: ${src}`);
        setCurrentSrc(src);
        setSrcset('');
        
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setIsLoaded(true);
          setIsLoading(false);
          onLoad?.();
        };
        fallbackImg.onerror = () => {
          setHasError(true);
          setIsLoading(false);
          onError?.();
        };
        fallbackImg.src = src;
      } else {
        onError?.();
      }
    };
    
    img.src = optimalSource.src;
  }, [src, isLoading, isLoaded, getDeviceCapabilities, determineOptimalSource, onLoad, onError]);

  // Auto-load if priority
  useEffect(() => {
    if (priority) {
      loadImage();
    }
  }, [priority, loadImage]);

  // Preload image on hover (for non-priority images)
  useEffect(() => {
    if (!priority && !isLoaded && !isLoading) {
      const preloadOnHover = () => {
        loadImage();
        document.removeEventListener('mouseover', preloadOnHover);
      };
      
      document.addEventListener('mouseover', preloadOnHover);
      
      return () => {
        document.removeEventListener('mouseover', preloadOnHover);
      };
    }
  }, [priority, isLoaded, isLoading, loadImage]);

  return {
    src: currentSrc,
    srcset,
    isLoaded,
    hasError,
    isLoading,
    loadImage
  };
};

/**
 * Hook for batch image preloading
 */
export const useBatchImagePreloader = (imageSources: string[], options?: {
  maxConcurrent?: number;
  priority?: boolean;
}) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);

  const { maxConcurrent = 3, priority = false } = options || {};

  const preloadImages = useCallback(async () => {
    if (priority) {
      // Load all images immediately
      const loadPromises = imageSources.map(src => {
        setLoadingImages(prev => new Set(prev).add(src));
        
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set(prev).add(src));
            setLoadingImages(prev => {
              const newSet = new Set(prev);
              newSet.delete(src);
              return newSet;
            });
            resolve();
          };
          img.onerror = () => {
            setFailedImages(prev => new Set(prev).add(src));
            setLoadingImages(prev => {
              const newSet = new Set(prev);
              newSet.delete(src);
              return newSet;
            });
            resolve();
          };
          img.src = src;
        });
      });

      await Promise.all(loadPromises);
    } else {
      // Load images in batches
      for (let i = 0; i < imageSources.length; i += maxConcurrent) {
        const batch = imageSources.slice(i, i + maxConcurrent);
        
        await Promise.all(batch.map(src => {
          setLoadingImages(prev => new Set(prev).add(src));
          
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              setLoadedImages(prev => new Set(prev).add(src));
              setLoadingImages(prev => {
                const newSet = new Set(prev);
                newSet.delete(src);
                return newSet;
              });
              resolve();
            };
            img.onerror = () => {
              setFailedImages(prev => new Set(prev).add(src));
              setLoadingImages(prev => {
                const newSet = new Set(prev);
                newSet.delete(src);
                return newSet;
              });
              resolve();
            };
            img.src = src;
          });
        }));
        
        setProgress((i + batch.length) / imageSources.length * 100);
      }
    }
  }, [imageSources, maxConcurrent, priority]);

  useEffect(() => {
    if (imageSources.length > 0) {
      preloadImages();
    }
  }, [imageSources, preloadImages]);

  return {
    loadedImages,
    loadingImages,
    failedImages,
    progress,
    isComplete: loadedImages.size + failedImages.size === imageSources.length,
    preloadImages
  };
};


