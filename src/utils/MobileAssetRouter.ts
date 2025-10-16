/**
 * Mobile Asset Router
 * Intelligently routes assets based on device capabilities and performance
 */

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  devicePixelRatio: number;
  memoryGB: number;
  connectionType: string;
  effectiveType: string;
}

export interface AssetRouterConfig {
  enableMobileAssets: boolean;
  enableAdaptiveQuality: boolean;
  enableLogging: boolean;
  fallbackToDesktop: boolean;
}

export class MobileAssetRouter {
  private capabilities: DeviceCapabilities;
  private config: AssetRouterConfig;
  private assetCache = new Map<string, string>();
  private performanceLog: Array<{timestamp: number, action: string, details: any}> = [];

  constructor(config: Partial<AssetRouterConfig> = {}) {
    this.config = {
      enableMobileAssets: true, // Re-enabled with fallback support
      enableAdaptiveQuality: true,
      enableLogging: true,
      fallbackToDesktop: true,
      ...config
    };
    
    this.capabilities = this.detectDeviceCapabilities();
    this.log('AssetRouter initialized', { capabilities: this.capabilities, config: this.config });
  }

  /**
   * Detect device capabilities with enhanced mobile detection
   */
  private detectDeviceCapabilities(): DeviceCapabilities {
    const userAgent = navigator.userAgent;
    const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isMobile = window.innerWidth <= 768 || isMobileUA;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024 && !isMobileUA;
    const isDesktop = window.innerWidth > 1024 && !isMobileUA;

    // Enhanced memory detection
    const memoryGB = (navigator as any).deviceMemory || this.estimateMemoryFromUA(userAgent);
    
    // Connection detection
    const connection = (navigator as any).connection;
    const connectionType = connection?.type || 'unknown';
    const effectiveType = connection?.effectiveType || '4g';

    return {
      isMobile,
      isTablet,
      isDesktop,
      devicePixelRatio: window.devicePixelRatio,
      memoryGB,
      connectionType,
      effectiveType
    };
  }

  /**
   * Estimate memory from user agent (fallback)
   */
  private estimateMemoryFromUA(userAgent: string): number {
    if (/iPhone|iPad/i.test(userAgent)) {
      if (/iPhone 1[2-5]|iPad Pro/i.test(userAgent)) return 6; // Newer devices
      if (/iPhone [6-9]|iPad Air|iPad Pro/i.test(userAgent)) return 4; // Mid-range
      return 2; // Older devices
    }
    if (/Android/i.test(userAgent)) {
      if (/Pixel [4-7]|Galaxy S2[0-4]|OnePlus [8-9]/i.test(userAgent)) return 8; // Flagship
      if (/Galaxy S1[0-9]|Pixel [1-3]/i.test(userAgent)) return 4; // Mid-range
      return 2; // Budget
    }
    return 4; // Default
  }

  /**
   * Get optimized asset path based on device capabilities
   */
  getAssetPath(originalPath: string): string {
    const startTime = performance.now();
    
    // Check cache first
    if (this.assetCache.has(originalPath)) {
      const cachedPath = this.assetCache.get(originalPath)!;
      this.log('Asset cache hit', { originalPath, cachedPath, cacheSize: this.assetCache.size });
      return cachedPath;
    }

    let optimizedPath = originalPath;

    // Only apply mobile optimizations if enabled and device is mobile
    if (this.config.enableMobileAssets && this.capabilities.isMobile) {
      optimizedPath = this.getMobileOptimizedPath(originalPath);
    }

    // Cache the result
    this.assetCache.set(originalPath, optimizedPath);
    
    const duration = performance.now() - startTime;
    this.log('Asset path resolved', { 
      originalPath, 
      optimizedPath, 
      duration: `${duration.toFixed(2)}ms`,
      deviceType: this.capabilities.isMobile ? 'mobile' : 'desktop'
    });

    return optimizedPath;
  }

  /**
   * Get mobile-optimized asset path
   */
  private getMobileOptimizedPath(originalPath: string): string {
    // Handle different asset types
    if (originalPath.startsWith('images/')) {
      return this.getMobileImagePath(originalPath);
    }
    if (originalPath.startsWith('videos/')) {
      return this.getMobileVideoPath(originalPath);
    }
    if (originalPath.startsWith('mp3/')) {
      return this.getMobileAudioPath(originalPath);
    }

    // Return original path for unknown types
    return originalPath;
  }

  /**
   * Get mobile-optimized image path with fallback
   */
  private getMobileImagePath(imagePath: string): string {
    const basePath = imagePath.replace('images/', '');
    
    // Mobile assets are now available in public/mobile-assets/images/
    const mobilePath = `mobile-assets/images/${basePath}`;
    
    // Check if mobile asset exists
    if (this.mobileAssetExists(basePath)) {
      this.log('Mobile image path found', { originalPath: imagePath, mobilePath });
      return mobilePath;
    } else {
      this.log('Mobile image path fallback to desktop', { originalPath: imagePath, mobilePath, fallback: 'desktop' });
      return imagePath; // Fallback to original desktop path
    }
  }

  /**
   * Check if mobile asset exists (comprehensive check)
   */
  private mobileAssetExists(basePath: string): boolean {
    // Since we now have all mobile assets in public/mobile-assets/images/
    // we can assume they exist for the major asset categories
    
    // Check if it's in the street folder (we know street assets exist)
    if (basePath.includes('street/')) {
      return true;
    }
    
    // Check if it's in the road folder (we know road assets exist)
    if (basePath.includes('road/')) {
      return true;
    }
    
    // Check if it's in the plane folder (we know plane assets exist)
    if (basePath.includes('plane/')) {
      return true;
    }
    
    // Check for common image files that we know exist
    const commonImages = [
      'background.webp', 'logo.png', 'logo.svg', 'mask3.png', 'floor_heightmap.png',
      'bush.png', 'car.png', 'smoke.png', 'trophy_1.png', 'trophy_2.png', 'trophy_3.png',
      'paper.webp', 'sand.png', 'divider.png', 'floor.png', 'history-1.jpg', 'history-2.jpg'
    ];
    
    const fileName = basePath.split('/').pop() || '';
    if (commonImages.includes(fileName)) {
      return true;
    }
    
    // For other assets, fallback to desktop
    return false;
  }

  /**
   * Get mobile-optimized video path
   */
  private getMobileVideoPath(videoPath: string): string {
    const baseName = videoPath.replace('videos/', '').replace('.mp4', '');
    
    // Check if mobile video exists in mobile-assets/videos/
    const mobilePath = `mobile-assets/videos/${baseName}_mobile.mp4`;
    
    // For intro video, we know intro_mobile.mp4 exists
    if (baseName === 'intro') {
      this.log('Mobile video path found', { originalPath: videoPath, mobilePath: 'mobile-assets/videos/intro_mobile.mp4' });
      return 'mobile-assets/videos/intro_mobile.mp4';
    }
    
    this.log('Mobile video path fallback to desktop', { originalPath: videoPath, mobilePath });
    return videoPath; // Fallback to original desktop path
  }

  /**
   * Get mobile-optimized audio path
   */
  private getMobileAudioPath(audioPath: string): string {
    const baseName = audioPath.replace('mp3/', '');
    
    // Audio files are compressed but we'll use the same path structure
    const mobilePath = `mobile-assets/mp3/${baseName}`;
    
    // We know all audio files exist in mobile-assets/mp3/
    this.log('Mobile audio path found', { originalPath: audioPath, mobilePath });
    return mobilePath;
  }

  /**
   * Enhanced logging with performance tracking
   */
  private log(action: string, details: any = {}): void {
    if (!this.config.enableLogging) return;

    const logEntry = {
      timestamp: performance.now(),
      action,
      details,
      deviceType: this.capabilities.isMobile ? 'mobile' : 'desktop'
    };

    this.performanceLog.push(logEntry);

    // Keep only last 100 log entries
    if (this.performanceLog.length > 100) {
      this.performanceLog.shift();
    }

    // Console logging with emojis for better visibility
    const emoji = this.capabilities.isMobile ? '📱' : '🖥️';
    console.log(`${emoji} [MobileAssetRouter] ${action}`, details);
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    cacheSize: number;
    logCount: number;
    deviceType: string;
    memoryGB: number;
    connectionType: string;
  } {
    return {
      cacheSize: this.assetCache.size,
      logCount: this.performanceLog.length,
      deviceType: this.capabilities.isMobile ? 'mobile' : this.capabilities.isTablet ? 'tablet' : 'desktop',
      memoryGB: this.capabilities.memoryGB,
      connectionType: this.capabilities.effectiveType
    };
  }

  /**
   * Clear asset cache
   */
  clearCache(): void {
    this.assetCache.clear();
    this.log('Asset cache cleared', { cacheSize: 0 });
  }

  /**
   * Enable/disable mobile assets
   */
  setMobileAssetsEnabled(enabled: boolean): void {
    this.config.enableMobileAssets = enabled;
    this.log('Mobile assets setting changed', { enabled });
  }
}

// Singleton instance
let mobileAssetRouter: MobileAssetRouter | null = null;

/**
 * Get the mobile asset router instance
 */
export const getMobileAssetRouter = (): MobileAssetRouter => {
  if (!mobileAssetRouter) {
    mobileAssetRouter = new MobileAssetRouter();
  }
  return mobileAssetRouter;
};

/**
 * Initialize mobile asset router with custom config
 */
export const initializeMobileAssetRouter = (config: Partial<AssetRouterConfig> = {}): MobileAssetRouter => {
  mobileAssetRouter = new MobileAssetRouter(config);
  return mobileAssetRouter;
};
