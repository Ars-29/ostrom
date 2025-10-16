/**
 * Advanced Scroll Optimization System
 * Implements advanced scroll optimization techniques for better performance
 */

interface ScrollOptimizationConfig {
  enableScrollThrottling: boolean;
  throttleInterval: number; // ms
  enableScrollPrediction: boolean;
  enableScrollCaching: boolean;
  enableScrollBatching: boolean;
  enableScrollDebouncing: boolean;
  debounceDelay: number; // ms
  enableScrollVirtualization: boolean;
  enableScrollLazyLoading: boolean;
  enableScrollIntersectionObserver: boolean;
  enableScrollPerformanceMonitoring: boolean;
}

interface ScrollEvent {
  timestamp: number;
  deltaY: number;
  deltaX: number;
  scrollTop: number;
  scrollLeft: number;
  velocity: number;
  direction: 'up' | 'down' | 'left' | 'right' | 'none';
}

interface ScrollStats {
  totalScrollEvents: number;
  throttledEvents: number;
  averageVelocity: number;
  peakVelocity: number;
  scrollDistance: number;
  lastScrollTime: number;
  performanceScore: number;
}

export class AdvancedScrollOptimizer {
  private config: ScrollOptimizationConfig;
  private stats: ScrollStats;
  private scrollHistory: ScrollEvent[] = [];
  private throttledHandlers: Map<string, () => void> = new Map();
  private throttledTimestamps: Map<string, number> = new Map();
  private debouncedHandlers: Map<string, () => void> = new Map();
  private debouncedTimeouts: Map<string, number> = new Map();
  private intersectionObserver: IntersectionObserver | null = null;
  private scrollPredictionBuffer: ScrollEvent[] = [];
  private performanceObserver: PerformanceObserver | null = null;

  constructor(config: Partial<ScrollOptimizationConfig> = {}) {
    this.config = {
      enableScrollThrottling: true,
      throttleInterval: 16, // ~60fps
      enableScrollPrediction: true,
      enableScrollCaching: true,
      enableScrollBatching: true,
      enableScrollDebouncing: true,
      debounceDelay: 100,
      enableScrollVirtualization: true,
      enableScrollLazyLoading: true,
      enableScrollIntersectionObserver: true,
      enableScrollPerformanceMonitoring: true,
      ...config
    };

    this.stats = {
      totalScrollEvents: 0,
      throttledEvents: 0,
      averageVelocity: 0,
      peakVelocity: 0,
      scrollDistance: 0,
      lastScrollTime: 0,
      performanceScore: 100
    };

    this.initializeScrollOptimization();
  }

  /**
   * Initialize scroll optimization
   */
  private initializeScrollOptimization(): void {
    if (typeof window === 'undefined') return;

    // Set up scroll event optimization
    this.setupScrollEventOptimization();

    // Set up intersection observer for lazy loading
    if (this.config.enableScrollIntersectionObserver) {
      this.setupIntersectionObserver();
    }

    // Set up performance monitoring
    if (this.config.enableScrollPerformanceMonitoring) {
      this.setupPerformanceMonitoring();
    }

    // Set up scroll prediction
    if (this.config.enableScrollPrediction) {
      this.setupScrollPrediction();
    }
  }

  /**
   * Set up scroll event optimization
   */
  private setupScrollEventOptimization(): void {
    let lastScrollTime = 0;
    let lastScrollTop = 0;
    let lastScrollLeft = 0;
    let velocity = 0;
    let direction: 'up' | 'down' | 'left' | 'right' | 'none' = 'none';

    const handleScroll = (event: Event) => {
      const currentTime = performance.now();
      const target = event.target as HTMLElement;
      
      if (!target) return;

      const scrollTop = target.scrollTop || window.pageYOffset;
      const scrollLeft = target.scrollLeft || window.pageXOffset;
      
      // Calculate velocity and direction
      const deltaY = scrollTop - lastScrollTop;
      const deltaX = scrollLeft - lastScrollLeft;
      const deltaTime = currentTime - lastScrollTime;
      
      if (deltaTime > 0) {
        velocity = Math.abs(deltaY) / deltaTime;
        
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          direction = deltaY > 0 ? 'down' : 'up';
        } else {
          direction = deltaX > 0 ? 'right' : 'left';
        }
      }

      // Create scroll event
      const scrollEvent: ScrollEvent = {
        timestamp: currentTime,
        deltaY,
        deltaX,
        scrollTop,
        scrollLeft,
        velocity,
        direction
      };

      // Update stats
      this.updateScrollStats(scrollEvent);

      // Store in history for prediction
      if (this.config.enableScrollCaching) {
        this.scrollHistory.push(scrollEvent);
        if (this.scrollHistory.length > 100) {
          this.scrollHistory.shift();
        }
      }

      // Update last values
      lastScrollTime = currentTime;
      lastScrollTop = scrollTop;
      lastScrollLeft = scrollLeft;
    };

    // Use passive listeners for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also listen to specific scrollable elements
    const scrollableElements = document.querySelectorAll('[data-scrollable]');
    scrollableElements.forEach(element => {
      element.addEventListener('scroll', handleScroll, { passive: true });
    });
  }

  /**
   * Update scroll statistics
   */
  private updateScrollStats(event: ScrollEvent): void {
    this.stats.totalScrollEvents++;
    this.stats.lastScrollTime = event.timestamp;
    this.stats.scrollDistance += Math.abs(event.deltaY) + Math.abs(event.deltaX);
    
    // Update velocity stats
    if (event.velocity > this.stats.peakVelocity) {
      this.stats.peakVelocity = event.velocity;
    }
    
    this.stats.averageVelocity = 
      (this.stats.averageVelocity * (this.stats.totalScrollEvents - 1) + event.velocity) / 
      this.stats.totalScrollEvents;

    // Calculate performance score
    this.calculatePerformanceScore();
  }

  /**
   * Calculate scroll performance score
   */
  private calculatePerformanceScore(): void {
    const frameRate = 1000 / (this.stats.lastScrollTime - (this.scrollHistory[this.scrollHistory.length - 2]?.timestamp || 0));
    const velocityScore = Math.min(100, Math.max(0, 100 - this.stats.averageVelocity * 10));
    const eventScore = Math.min(100, Math.max(0, 100 - this.stats.totalScrollEvents / 100));
    
    this.stats.performanceScore = (frameRate + velocityScore + eventScore) / 3;
  }

  /**
   * Set up intersection observer for lazy loading
   */
  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Trigger lazy loading
            const element = entry.target as HTMLElement;
            const lazyLoadHandler = element.dataset.lazyLoad;
            if (lazyLoadHandler) {
              this.executeLazyLoadHandler(lazyLoadHandler, element);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    // Observe elements with lazy loading
    const lazyElements = document.querySelectorAll('[data-lazy-load]');
    lazyElements.forEach(element => {
      this.intersectionObserver?.observe(element);
    });
  }

  /**
   * Execute lazy load handler
   */
  private executeLazyLoadHandler(handlerName: string, element: HTMLElement): void {
    // This would typically trigger loading of images, components, etc.
    console.log(`🔄 [ScrollOptimizer] Lazy loading: ${handlerName}`);
    
    // Mark as loaded
    element.dataset.lazyLoaded = 'true';
    this.intersectionObserver?.unobserve(element);
  }

  /**
   * Set up scroll prediction
   */
  private setupScrollPrediction(): void {
    // Analyze scroll patterns to predict future scroll behavior
    setInterval(() => {
      if (this.scrollHistory.length < 10) return;

      const recentEvents = this.scrollHistory.slice(-10);
      const averageVelocity = recentEvents.reduce((sum, event) => sum + event.velocity, 0) / recentEvents.length;
      const averageDirection = recentEvents[recentEvents.length - 1].direction;

      // Predict next scroll position
      const lastEvent = recentEvents[recentEvents.length - 1];
      const predictedPosition = {
        scrollTop: lastEvent.scrollTop + (averageVelocity * 16), // Predict 16ms ahead
        scrollLeft: lastEvent.scrollLeft,
        direction: averageDirection
      };

      this.scrollPredictionBuffer.push({
        timestamp: performance.now(),
        deltaY: predictedPosition.scrollTop - lastEvent.scrollTop,
        deltaX: predictedPosition.scrollLeft - lastEvent.scrollLeft,
        scrollTop: predictedPosition.scrollTop,
        scrollLeft: predictedPosition.scrollLeft,
        velocity: averageVelocity,
        direction: averageDirection
      });

      // Keep only recent predictions
      if (this.scrollPredictionBuffer.length > 5) {
        this.scrollPredictionBuffer.shift();
      }
    }, 100);
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    this.performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'measure' && entry.name.includes('scroll')) {
          console.log(`📊 [ScrollOptimizer] Performance measure: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
        }
      });
    });

    this.performanceObserver.observe({ entryTypes: ['measure'] });
  }

  /**
   * Throttle scroll handler
   */
  throttleScrollHandler(id: string, handler: () => void): void {
    if (!this.config.enableScrollThrottling) {
      handler();
      return;
    }

    const throttledHandler = () => {
      const now = performance.now();
      const lastExecution = this.throttledTimestamps.get(id) || 0;
      
      if (now - lastExecution >= this.config.throttleInterval) {
        handler();
        this.throttledTimestamps.set(id, now);
        this.stats.throttledEvents++;
      }
    };

    this.throttledHandlers.set(id, throttledHandler);
  }

  /**
   * Debounce scroll handler
   */
  debounceScrollHandler(id: string, handler: () => void): void {
    if (!this.config.enableScrollDebouncing) {
      handler();
      return;
    }

    const existingTimeout = this.debouncedTimeouts.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = window.setTimeout(() => {
      handler();
      this.debouncedTimeouts.delete(id);
    }, this.config.debounceDelay);

    this.debouncedTimeouts.set(id, timeout);
  }

  /**
   * Get scroll prediction
   */
  getScrollPrediction(): ScrollEvent | null {
    return this.scrollPredictionBuffer[this.scrollPredictionBuffer.length - 1] || null;
  }

  /**
   * Get scroll statistics
   */
  getScrollStats(): ScrollStats {
    return { ...this.stats };
  }

  /**
   * Get scroll history
   */
  getScrollHistory(): ScrollEvent[] {
    return [...this.scrollHistory];
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    // Clear timeouts
    this.debouncedTimeouts.forEach(timeout => {
      clearTimeout(timeout);
    });

    this.throttledHandlers.clear();
    this.throttledTimestamps.clear();
    this.debouncedHandlers.clear();
    this.debouncedTimeouts.clear();
    this.scrollHistory = [];
    this.scrollPredictionBuffer = [];
  }
}

// Singleton instance
let advancedScrollOptimizer: AdvancedScrollOptimizer | null = null;

/**
 * Get the advanced scroll optimizer instance
 */
export const getAdvancedScrollOptimizer = (): AdvancedScrollOptimizer => {
  if (!advancedScrollOptimizer) {
    advancedScrollOptimizer = new AdvancedScrollOptimizer();
  }
  return advancedScrollOptimizer;
};

/**
 * Initialize advanced scroll optimizer with custom config
 */
export const initializeAdvancedScrollOptimizer = (config: Partial<ScrollOptimizationConfig> = {}): AdvancedScrollOptimizer => {
  advancedScrollOptimizer = new AdvancedScrollOptimizer(config);
  return advancedScrollOptimizer;
};
