import React, { useState, useEffect, useRef } from 'react';

interface ResponsiveVideoProps {
  src: string;
  poster?: string;
  className?: string;
  quality?: 'high' | 'medium' | 'low';
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}

interface VideoManifest {
  version: string;
  generated: string;
  videos: {
    [key: string]: {
      original: string;
      compressed: {
        high: { mp4: string; webm: string };
        medium: { mp4: string; webm: string };
        low: { mp4: string; webm: string };
      };
      thumbnail: string;
      duration: number;
    };
  };
}

const ResponsiveVideo: React.FC<ResponsiveVideoProps> = ({
  src,
  poster,
  className = '',
  quality = 'medium',
  autoplay = false,
  muted = true,
  loop = false,
  controls = false,
  loading = 'lazy',
  onLoad,
  onError,
  onPlay,
  onPause
}) => {
  const [videoManifest, setVideoManifest] = useState<VideoManifest | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [currentPoster, setCurrentPoster] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load video manifest
  useEffect(() => {
    const loadManifest = async () => {
      try {
        const response = await fetch('/videos/video-manifest.json');
        if (response.ok) {
          const manifest = await response.json();
          setVideoManifest(manifest);
        }
      } catch (error) {
        console.warn('⚠️ [ResponsiveVideo] Failed to load video manifest:', error);
      }
    };

    loadManifest();
  }, []);

  // Determine optimal video source
  useEffect(() => {
    if (!videoManifest) {
      // Fallback to original source
      setCurrentSrc(src);
      setCurrentPoster(poster || '');
      return;
    }

    // Extract base name from src (e.g., 'intro' from 'intro.mp4')
    const baseName = src.replace(/\.(mp4|webm|mov|avi)$/i, '');
    const videoData = videoManifest.videos[baseName];

    if (videoData) {
      // Use compressed version
      const compressedSrc = videoData.compressed[quality];
      if (compressedSrc) {
        // Prefer WebM for better compression, fallback to MP4
        const webmSrc = compressedSrc.webm;
        
        setCurrentSrc(`/videos/${webmSrc}`);
        setCurrentPoster(`/videos/${videoData.thumbnail}`);
        return;
      }
    }

    // Fallback to original source
    setCurrentSrc(src);
    setCurrentPoster(poster || '');
  }, [src, poster, quality, videoManifest]);

  // Handle video load
  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  // Handle video error
  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    
    // Try fallback to MP4 if WebM failed
    if (currentSrc.includes('.webm')) {
      const mp4Src = currentSrc.replace('.webm', '.mp4');
      console.warn(`⚠️ [ResponsiveVideo] WebM failed, trying MP4: ${mp4Src}`);
      setCurrentSrc(mp4Src);
    } else if (currentSrc !== src) {
      // Fallback to original source
      console.warn(`⚠️ [ResponsiveVideo] Compressed video failed, trying original: ${src}`);
      setCurrentSrc(src);
    } else {
      onError?.();
    }
  };

  // Handle play/pause events
  const handlePlay = () => {
    onPlay?.();
  };

  const handlePause = () => {
    onPause?.();
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'lazy' && videoRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const video = entry.target as HTMLVideoElement;
              video.load();
              observer.unobserve(video);
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(videoRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [loading]);

  return (
    <div className={`responsive-video-container ${className}`} style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        src={currentSrc}
        poster={currentPoster}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        controls={controls}
        onLoadedData={handleLoad}
        onError={handleError}
        onPlay={handlePlay}
        onPause={handlePause}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        playsInline // Important for mobile
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
          Loading video...
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
          Failed to load video
        </div>
      )}
      
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default ResponsiveVideo;

