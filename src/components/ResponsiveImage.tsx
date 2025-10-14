import React, { useState, useEffect } from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  quality?: 'high' | 'medium' | 'low';
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

interface ImageManifest {
  version: string;
  generated: string;
  images: {
    [key: string]: {
      original: string;
      webp: {
        high: string;
        medium: string;
        low: string;
      };
      responsive: {
        [key: string]: string;
      };
    };
  };
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  quality = 'medium',
  width,
  height,
  loading = 'lazy',
  onLoad,
  onError
}) => {
  const [imageManifest, setImageManifest] = useState<ImageManifest | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  // Load image manifest
  useEffect(() => {
    const loadManifest = async () => {
      try {
        const response = await fetch('/images/image-manifest.json');
        if (response.ok) {
          const manifest = await response.json();
          setImageManifest(manifest);
        }
      } catch (error) {
        console.warn('⚠️ [ResponsiveImage] Failed to load image manifest:', error);
      }
    };

    loadManifest();
  }, []);

  // Determine best image source
  useEffect(() => {
    if (!imageManifest) {
      // Fallback to original source
      setCurrentSrc(src);
      return;
    }

    // Extract base name from src (e.g., 'street/church-thirdplan' from 'street/church-thirdplan.jpg')
    const baseName = src.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const imageData = imageManifest.images[baseName];

    if (imageData) {
      // Use compressed WebP version
      const webpSrc = imageData.webp[quality];
      if (webpSrc) {
        setCurrentSrc(`/images/${webpSrc}`);
        return;
      }
    }

    // Fallback to original source
    setCurrentSrc(src);
  }, [src, quality, imageManifest]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    
    // Fallback to original source if compressed version fails
    if (currentSrc !== src) {
      console.warn(`⚠️ [ResponsiveImage] Compressed image failed, falling back to original: ${src}`);
      setCurrentSrc(src);
    } else {
      onError?.();
    }
  };

  // Generate srcset for responsive images
  const generateSrcSet = () => {
    if (!imageManifest) return '';

    const baseName = src.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const imageData = imageManifest.images[baseName];

    if (!imageData?.responsive) return '';

    const srcset = Object.entries(imageData.responsive)
      .map(([width, path]) => `/images/${path} ${width}`)
      .join(', ');

    return srcset;
  };

  const srcset = generateSrcSet();

  return (
    <picture className={className}>
      {/* WebP sources with srcset */}
      {srcset && (
        <source
          srcSet={srcset}
          sizes="(max-width: 640px) 640px, (max-width: 1280px) 1280px, 1920px"
          type="image/webp"
        />
      )}
      
      {/* Fallback image */}
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          ...(hasError && { border: '2px solid #ff6b6b' })
        }}
      />
      
      {/* Loading indicator */}
      {!isLoaded && !hasError && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: '14px'
          }}
        >
          Loading...
        </div>
      )}
      
      {/* Error indicator */}
      {hasError && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#ffebee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d32f2f',
            fontSize: '14px',
            border: '2px solid #ff6b6b'
          }}
        >
          Failed to load image
        </div>
      )}
      
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </picture>
  );
};

export default ResponsiveImage;

