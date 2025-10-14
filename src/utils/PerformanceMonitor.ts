// src/utils/PerformanceMonitor.ts
interface PerformanceMetrics {
  loadStart: number;
  fontsReady: number;
  criticalAssetsLoaded: number;
  appReady: number;
  totalLoadTime: number;
  fontLoadTime: number;
  assetLoadTime: number;
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private startTime: number = 0;
  private initialized: boolean = false;

  constructor() {
    if (this.initialized) {
      console.log('⚠️ [PerformanceMonitor] Already initialized, skipping...');
      return;
    }
    
    this.startTime = performance.now();
    this.metrics.loadStart = this.startTime;
    this.initialized = true;
    console.log('🚀 [PerformanceMonitor] Starting performance monitoring...');
  }

  markFontsReady(): void {
    this.metrics.fontsReady = performance.now();
    this.metrics.fontLoadTime = this.metrics.fontsReady - this.startTime;
    console.log(`📝 [PerformanceMonitor] Fonts ready in ${this.metrics.fontLoadTime?.toFixed(2)}ms`);
  }

  markCriticalAssetsLoaded(): void {
    this.metrics.criticalAssetsLoaded = performance.now();
    this.metrics.assetLoadTime = this.metrics.criticalAssetsLoaded - (this.metrics.fontsReady || this.startTime);
    console.log(`📦 [PerformanceMonitor] Critical assets loaded in ${this.metrics.assetLoadTime?.toFixed(2)}ms`);
  }

  markAppReady(): void {
    this.metrics.appReady = performance.now();
    this.metrics.totalLoadTime = this.metrics.appReady - this.startTime;
    console.log(`🎉 [PerformanceMonitor] App ready in ${this.metrics.totalLoadTime?.toFixed(2)}ms`);
    
    this.logSummary();
  }

  private logSummary(): void {
    console.log('📊 [PerformanceMonitor] === PERFORMANCE SUMMARY ===');
    console.log(`⏱️ Total Load Time: ${this.metrics.totalLoadTime?.toFixed(2)}ms`);
    console.log(`📝 Font Load Time: ${this.metrics.fontLoadTime?.toFixed(2)}ms`);
    console.log(`📦 Asset Load Time: ${this.metrics.assetLoadTime?.toFixed(2)}ms`);
    
    // Performance analysis
    if (this.metrics.totalLoadTime && this.metrics.totalLoadTime < 1000) {
      console.log('✅ [PerformanceMonitor] EXCELLENT: Load time < 1s');
    } else if (this.metrics.totalLoadTime && this.metrics.totalLoadTime < 2000) {
      console.log('🟡 [PerformanceMonitor] GOOD: Load time < 2s');
    } else if (this.metrics.totalLoadTime && this.metrics.totalLoadTime < 3000) {
      console.log('🟠 [PerformanceMonitor] FAIR: Load time < 3s');
    } else {
      console.log('🔴 [PerformanceMonitor] NEEDS IMPROVEMENT: Load time > 3s');
    }
    
    console.log('📊 [PerformanceMonitor] === END SUMMARY ===');
  }

  getMetrics(): PerformanceMetrics {
    return this.metrics as PerformanceMetrics;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

export default PerformanceMonitor;
