/**
 * Enhanced Mobile Performance Optimizer
 * Improves fluidity and optimizes image weights for mobile devices
 */

export interface MobileOptimizationConfig {
  // Image optimization
  enableWebP: boolean;
  enableAVIF: boolean;
  qualityLevels: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  
  // Performance optimizations
  enableLazyLoading: boolean;
  enableIntersectionObserver: boolean;
  enablePreloading: boolean;
  
  // Mobile-specific settings
  reduceAnimations: boolean;
  optimizeParticles: boolean;
  enableTouchOptimization: boolean;
}

export class MobilePerformanceOptimizer {
  private config: MobileOptimizationConfig;
  private isMobile: boolean;
  private isTablet: boolean;
  private connectionSpeed: 'slow' | 'medium' | 'fast';
  
  constructor() {
    this.isMobile = this.detectMobile();
    this.isTablet = this.detectTablet();
    this.connectionSpeed = this.detectConnectionSpeed();
    
    this.config = this.getOptimalConfig();
    
    console.log('📱 [MobileOptimizer] Initialized:', {
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      connectionSpeed: this.connectionSpeed,
      config: this.config
    });
  }
  
  private detectMobile(): boolean {
    return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768 ||
           'ontouchstart' in window;
  }
  
  private detectTablet(): boolean {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  }
  
  private detectConnectionSpeed(): 'slow' | 'medium' | 'fast' {
    const connection = (navigator as any).connection;
    if (!connection) return 'medium';
    
    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
      return 'slow';
    } else if (effectiveType === '3g' || downlink < 5) {
      return 'medium';
    } else {
      return 'fast';
    }
  }
  
  private getOptimalConfig(): MobileOptimizationConfig {
    return {
      enableWebP: true,
      enableAVIF: this.connectionSpeed === 'fast',
      qualityLevels: {
        mobile: this.connectionSpeed === 'slow' ? 0.6 : 0.8,
        tablet: this.connectionSpeed === 'slow' ? 0.7 : 0.85,
        desktop: 0.9
      },
      enableLazyLoading: true,
      enableIntersectionObserver: true,
      enablePreloading: this.connectionSpeed !== 'slow',
      reduceAnimations: this.isMobile && this.connectionSpeed === 'slow',
      optimizeParticles: this.isMobile,
      enableTouchOptimization: this.isMobile || this.isTablet
    };
  }
  
  /**
   * Get optimal image quality for current device
   */
  public getImageQuality(): number {
    if (this.isMobile) return this.config.qualityLevels.mobile;
    if (this.isTablet) return this.config.qualityLevels.tablet;
    return this.config.qualityLevels.desktop;
  }
  
  /**
   * Get optimal image format for current device
   */
  public getOptimalImageFormat(originalSrc: string): string {
    const baseName = originalSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    
    if (this.config.enableAVIF && this.connectionSpeed === 'fast') {
      return `${baseName}.avif`;
    } else if (this.config.enableWebP) {
      return `${baseName}.webp`;
    }
    
    return originalSrc;
  }
  
  /**
   * Generate responsive image srcset
   */
  public generateSrcSet(baseSrc: string): string {
    const sizes = [
      { width: 320, suffix: '_sm' },
      { width: 640, suffix: '_md' },
      { width: 1280, suffix: '_lg' },
      { width: 1920, suffix: '_xl' }
    ];
    
    const srcset = sizes.map(size => {
      const format = this.getOptimalImageFormat(baseSrc);
      const optimizedSrc = format.replace(/\.(webp|avif)$/i, `${size.suffix}.$1`);
      return `${optimizedSrc} ${size.width}w`;
    }).join(', ');
    
    return srcset;
  }
  
  /**
   * Check if animations should be reduced
   */
  public shouldReduceAnimations(): boolean {
    return this.config.reduceAnimations;
  }
  
  /**
   * Get optimal particle count for current device
   */
  public getOptimalParticleCount(baseCount: number): number {
    if (!this.config.optimizeParticles) return baseCount;
    
    if (this.connectionSpeed === 'slow') {
      return Math.floor(baseCount * 0.3);
    } else if (this.connectionSpeed === 'medium') {
      return Math.floor(baseCount * 0.6);
    }
    
    return baseCount;
  }
  
  /**
   * Check if touch optimization should be enabled
   */
  public shouldEnableTouchOptimization(): boolean {
    return this.config.enableTouchOptimization;
  }
  
  /**
   * Get mobile-specific CSS optimizations
   */
  public getMobileCSSOptimizations(): React.CSSProperties {
    if (!this.isMobile) return {};
    
    return {
      // Reduce animations on slow connections
      ...(this.shouldReduceAnimations() && {
        animationDuration: '0.1s',
        transitionDuration: '0.1s'
      }),
      
      // Optimize for touch
      touchAction: 'manipulation',
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      
      // Improve scrolling performance
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'contain'
    };
  }
  
  /**
   * Preload critical images
   */
  public preloadCriticalImages(imageUrls: string[]): Promise<void[]> {
    if (!this.config.enablePreloading) {
      return Promise.resolve([]);
    }
    
    const preloadPromises = imageUrls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to preload ${url}`));
        img.src = this.getOptimalImageFormat(url);
      });
    });
    
    return Promise.all(preloadPromises);
  }
  
  /**
   * Get configuration for current device
   */
  public getConfig(): MobileOptimizationConfig {
    return { ...this.config };
  }
  
  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MobileOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('📱 [MobileOptimizer] Config updated:', this.config);
  }
}

// Singleton instance
let mobileOptimizer: MobilePerformanceOptimizer | null = null;

/**
 * Get the mobile optimizer instance
 */
export const getMobileOptimizer = (): MobilePerformanceOptimizer => {
  if (!mobileOptimizer) {
    mobileOptimizer = new MobilePerformanceOptimizer();
  }
  return mobileOptimizer;
};
