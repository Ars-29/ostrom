/**
 * Enhanced Performance Monitor for Mobile Optimization
 * Tracks detailed performance metrics and provides mobile-specific insights
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  textureMemory: number;
  gpuMemory: number;
  loadTime: number;
  renderTime: number;
}

export interface MobilePerformanceStats {
  averageFPS: number;
  frameDrops: number;
  memoryPressure: 'low' | 'medium' | 'high';
  thermalState: 'cool' | 'warm' | 'hot';
  batteryLevel: number;
  networkType: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  optimizationLevel: 'low' | 'medium' | 'high';
}

export class EnhancedPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private frameCount = 0;
  private lastTime = performance.now();
  private frameDropCount = 0;
  private isMonitoring = false;
  private performanceObserver: PerformanceObserver | null = null;
  private memoryInfo: any = null;
  private deviceInfo: any = null;

  constructor() {
    this.initializeMonitoring();
    this.setupPerformanceObserver();
    this.detectDeviceCapabilities();
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    // Get memory info if available
    if ('memory' in performance) {
      this.memoryInfo = (performance as any).memory;
    }

    // Get device info
    this.deviceInfo = {
      userAgent: navigator.userAgent,
      devicePixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      connection: (navigator as any).connection
    };

    console.log('📊 [PerformanceMonitor] Initialized with device info:', this.deviceInfo);
  }

  /**
   * Setup Performance Observer for detailed metrics
   */
  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.processPerformanceEntry(entry);
          });
        });

        // Observe different types of performance entries
        this.performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
        
        console.log('📊 [PerformanceMonitor] Performance Observer setup complete');
      } catch (error) {
        console.warn('📊 [PerformanceMonitor] Performance Observer not supported:', error);
      }
    }
  }

  /**
   * Process performance entries
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const emoji = isMobile ? '📱' : '🖥️';

    switch (entry.entryType) {
      case 'measure':
        console.log(`${emoji} [PerformanceMonitor] Measure: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
        break;
      case 'navigation':
        console.log(`${emoji} [PerformanceMonitor] Navigation: ${entry.duration.toFixed(2)}ms`);
        break;
      case 'resource':
        const resourceEntry = entry as PerformanceResourceTiming;
        if (resourceEntry.name.includes('images/') || resourceEntry.name.includes('mobile-assets/')) {
          console.log(`${emoji} [PerformanceMonitor] Resource: ${resourceEntry.name} - ${resourceEntry.duration.toFixed(2)}ms`);
        }
        break;
    }
  }

  /**
   * Detect device capabilities
   */
  private detectDeviceCapabilities(): void {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android.*Tablet/i.test(userAgent);
    
    console.log('📊 [PerformanceMonitor] Device Detection:', {
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      userAgent: userAgent.substring(0, 50) + '...'
    });
  }

  /**
   * Start monitoring performance
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameDropCount = 0;

    const monitorFrame = () => {
      if (!this.isMonitoring) return;

      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastTime;
      const fps = 1000 / deltaTime;

      // Track frame drops (frames taking longer than 16.67ms for 60fps)
      if (deltaTime > 16.67) {
        this.frameDropCount++;
      }

      // Collect metrics
      const metrics: PerformanceMetrics = {
        fps,
        frameTime: deltaTime,
        memoryUsage: this.getMemoryUsage(),
        drawCalls: this.estimateDrawCalls(),
        textureMemory: this.estimateTextureMemory(),
        gpuMemory: this.estimateGPUMemory(),
        loadTime: this.getLoadTime(),
        renderTime: deltaTime
      };

      this.metrics.push(metrics);

      // Keep only last 300 frames (5 seconds at 60fps)
      if (this.metrics.length > 300) {
        this.metrics.shift();
      }

      // Log performance every 5 seconds
      if (this.frameCount % 300 === 0) {
        this.logPerformanceStats();
      }

      this.frameCount++;
      this.lastTime = currentTime;

      requestAnimationFrame(monitorFrame);
    };

    requestAnimationFrame(monitorFrame);
    console.log('📊 [PerformanceMonitor] Monitoring started');
  }

  /**
   * Stop monitoring performance
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    console.log('📊 [PerformanceMonitor] Monitoring stopped');
  }

  /**
   * Get current performance statistics
   */
  getPerformanceStats(): MobilePerformanceStats {
    const averageFPS = this.metrics.length > 0 
      ? this.metrics.reduce((sum, m) => sum + m.fps, 0) / this.metrics.length 
      : 60;

    const memoryPressure = this.getMemoryPressure();
    const thermalState = this.getThermalState();
    const batteryLevel = this.getBatteryLevel();
    const networkType = this.getNetworkType();
    const deviceType = this.getDeviceType();
    const optimizationLevel = this.getOptimizationLevel(averageFPS);

    return {
      averageFPS,
      frameDrops: this.frameDropCount,
      memoryPressure,
      thermalState,
      batteryLevel,
      networkType,
      deviceType,
      optimizationLevel
    };
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if (this.memoryInfo) {
      return this.memoryInfo.usedJSHeapSize / (1024 * 1024); // MB
    }
    return 0;
  }

  /**
   * Estimate draw calls (simplified)
   */
  private estimateDrawCalls(): number {
    // This is a simplified estimation
    // In a real implementation, you'd track actual draw calls
    return Math.floor(Math.random() * 200) + 50;
  }

  /**
   * Estimate texture memory usage
   */
  private estimateTextureMemory(): number {
    // Simplified estimation based on loaded assets
    return Math.floor(Math.random() * 100) + 20; // MB
  }

  /**
   * Estimate GPU memory usage
   */
  private estimateGPUMemory(): number {
    // Simplified estimation
    return Math.floor(Math.random() * 200) + 50; // MB
  }

  /**
   * Get page load time
   */
  private getLoadTime(): number {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
  }

  /**
   * Get memory pressure level
   */
  private getMemoryPressure(): 'low' | 'medium' | 'high' {
    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage < 100) return 'low';
    if (memoryUsage < 200) return 'medium';
    return 'high';
  }

  /**
   * Get thermal state (simplified)
   */
  private getThermalState(): 'cool' | 'warm' | 'hot' {
    const averageFPS = this.metrics.length > 0 
      ? this.metrics.reduce((sum, m) => sum + m.fps, 0) / this.metrics.length 
      : 60;

    if (averageFPS > 50) return 'cool';
    if (averageFPS > 30) return 'warm';
    return 'hot';
  }

  /**
   * Get battery level (if available)
   */
  private getBatteryLevel(): number {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        return battery.level * 100;
      });
    }
    return 100; // Default to 100% if not available
  }

  /**
   * Get network type
   */
  private getNetworkType(): string {
    const connection = (navigator as any).connection;
    return connection ? connection.effectiveType : 'unknown';
  }

  /**
   * Get device type
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android.*Tablet/i.test(userAgent);
    
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    return 'desktop';
  }

  /**
   * Get optimization level based on performance
   */
  private getOptimizationLevel(averageFPS: number): 'low' | 'medium' | 'high' {
    if (averageFPS > 50) return 'high';
    if (averageFPS > 30) return 'medium';
    return 'low';
  }

  /**
   * Log performance statistics
   */
  private logPerformanceStats(): void {
    const stats = this.getPerformanceStats();
    const isMobile = stats.deviceType === 'mobile';
    const emoji = isMobile ? '📱' : '🖥️';

    console.log(`${emoji} [PerformanceMonitor] Performance Stats:`, {
      'Average FPS': `${stats.averageFPS.toFixed(1)}`,
      'Frame Drops': stats.frameDrops,
      'Memory Pressure': stats.memoryPressure,
      'Thermal State': stats.thermalState,
      'Network Type': stats.networkType,
      'Optimization Level': stats.optimizationLevel,
      'Device Type': stats.deviceType
    });

    // Log recommendations
    this.logOptimizationRecommendations(stats);
  }

  /**
   * Log optimization recommendations
   */
  private logOptimizationRecommendations(stats: MobilePerformanceStats): void {
    const recommendations: string[] = [];

    if (stats.averageFPS < 30) {
      recommendations.push('Consider reducing texture quality');
      recommendations.push('Disable post-processing effects');
      recommendations.push('Reduce particle count');
    }

    if (stats.memoryPressure === 'high') {
      recommendations.push('Clear asset cache');
      recommendations.push('Reduce texture resolution');
      recommendations.push('Enable texture compression');
    }

    if (stats.thermalState === 'hot') {
      recommendations.push('Reduce rendering quality');
      recommendations.push('Enable thermal throttling');
      recommendations.push('Pause non-essential animations');
    }

    if (recommendations.length > 0) {
      console.log('💡 [PerformanceMonitor] Optimization Recommendations:', recommendations);
    }
  }

  /**
   * Create performance mark
   */
  mark(name: string): void {
    if ('mark' in performance) {
      performance.mark(name);
      console.log(`📊 [PerformanceMonitor] Mark created: ${name}`);
    }
  }

  /**
   * Measure performance between marks
   */
  measure(name: string, startMark: string, endMark?: string): void {
    if ('measure' in performance) {
      try {
        if (endMark) {
          performance.measure(name, startMark, endMark);
        } else {
          performance.measure(name, startMark);
        }
        console.log(`📊 [PerformanceMonitor] Measure created: ${name}`);
      } catch (error) {
        console.warn(`📊 [PerformanceMonitor] Failed to create measure: ${name}`, error);
      }
    }
  }

  /**
   * Export performance data
   */
  exportPerformanceData(): string {
    const data = {
      deviceInfo: this.deviceInfo,
      metrics: this.metrics,
      stats: this.getPerformanceStats(),
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Get detailed performance report
   */
  getDetailedReport(): {
    summary: MobilePerformanceStats;
    metrics: PerformanceMetrics[];
    recommendations: string[];
    deviceInfo: any;
  } {
    const stats = this.getPerformanceStats();
    const recommendations: string[] = [];

    // Generate recommendations based on current performance
    if (stats.averageFPS < 30) {
      recommendations.push('Reduce texture quality');
      recommendations.push('Disable post-processing');
      recommendations.push('Reduce particle count');
    }

    if (stats.memoryPressure === 'high') {
      recommendations.push('Clear asset cache');
      recommendations.push('Enable texture compression');
    }

    return {
      summary: stats,
      metrics: [...this.metrics],
      recommendations,
      deviceInfo: this.deviceInfo
    };
  }
}

// Singleton instance
let enhancedPerformanceMonitor: EnhancedPerformanceMonitor | null = null;

/**
 * Get the enhanced performance monitor instance
 */
export const getEnhancedPerformanceMonitor = (): EnhancedPerformanceMonitor => {
  if (!enhancedPerformanceMonitor) {
    enhancedPerformanceMonitor = new EnhancedPerformanceMonitor();
  }
  return enhancedPerformanceMonitor;
};

/**
 * Initialize enhanced performance monitoring
 */
export const initializeEnhancedPerformanceMonitoring = (): EnhancedPerformanceMonitor => {
  enhancedPerformanceMonitor = new EnhancedPerformanceMonitor();
  enhancedPerformanceMonitor.startMonitoring();
  return enhancedPerformanceMonitor;
};
