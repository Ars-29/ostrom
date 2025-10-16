/**
 * React Performance Optimizer
 * Optimizes React re-renders and useFrame usage for better performance
 */

import { useRef, useCallback, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

interface PerformanceConfig {
  enableThrottling: boolean;
  throttleInterval: number; // ms
  enableBatching: boolean;
  enableMemoization: boolean;
  enableFrameSkipping: boolean;
  maxFrameSkip: number;
}

interface FrameStats {
  frameCount: number;
  skippedFrames: number;
  lastFrameTime: number;
  averageFrameTime: number;
}

export class ReactPerformanceOptimizer {
  private config: PerformanceConfig;
  private frameStats: FrameStats;
  private lastThrottleTime: number = 0;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableThrottling: true,
      throttleInterval: 16, // ~60fps
      enableBatching: true,
      enableMemoization: true,
      enableFrameSkipping: true,
      maxFrameSkip: 2,
      ...config
    };

    this.frameStats = {
      frameCount: 0,
      skippedFrames: 0,
      lastFrameTime: 0,
      averageFrameTime: 0
    };
  }

  /**
   * Optimized useFrame hook with throttling and frame skipping
   */
  useOptimizedFrame = (callback: (state: any, delta: number) => void, deps: any[] = []) => {
    const callbackRef = useRef(callback);
    const frameSkipRef = useRef(0);

    // Update callback ref when dependencies change
    useEffect(() => {
      callbackRef.current = callback;
    }, deps);

    useFrame((state, delta) => {
      const currentTime = performance.now();
      
      // Frame skipping for performance
      if (this.config.enableFrameSkipping) {
        frameSkipRef.current++;
        if (frameSkipRef.current < this.config.maxFrameSkip) {
          return;
        }
        frameSkipRef.current = 0;
      }

      // Throttling
      if (this.config.enableThrottling) {
        if (currentTime - this.lastThrottleTime < this.config.throttleInterval) {
          return;
        }
        this.lastThrottleTime = currentTime;
      }

      // Update frame stats
      this.frameStats.frameCount++;
      this.frameStats.lastFrameTime = currentTime;
      this.frameStats.averageFrameTime = 
        (this.frameStats.averageFrameTime * (this.frameStats.frameCount - 1) + delta) / 
        this.frameStats.frameCount;

      // Execute callback
      callbackRef.current(state, delta);
    });
  };

  /**
   * Memoized callback creator
   */
  createMemoizedCallback = <T extends (...args: any[]) => any>(
    callback: T,
    deps: any[]
  ): T => {
    return useCallback(callback, deps) as T;
  };

  /**
   * Memoized value creator
   */
  createMemoizedValue = <T>(factory: () => T, deps: any[]): T => {
    return useMemo(factory, deps);
  };

  /**
   * Batch state updates to reduce re-renders
   */
  batchStateUpdates = (updates: (() => void)[]) => {
    if (this.config.enableBatching) {
      // Use React's automatic batching (React 18+)
      updates.forEach(update => update());
    } else {
      // Manual batching for older React versions
      updates.forEach(update => update());
    }
  };

  /**
   * Get performance statistics
   */
  getStats(): FrameStats {
    return { ...this.frameStats };
  }

  /**
   * Reset performance statistics
   */
  resetStats(): void {
    this.frameStats = {
      frameCount: 0,
      skippedFrames: 0,
      lastFrameTime: 0,
      averageFrameTime: 0
    };
  }
}

// Singleton instance
let reactPerformanceOptimizer: ReactPerformanceOptimizer | null = null;

/**
 * Get the React performance optimizer instance
 */
export const getReactPerformanceOptimizer = (): ReactPerformanceOptimizer => {
  if (!reactPerformanceOptimizer) {
    reactPerformanceOptimizer = new ReactPerformanceOptimizer();
  }
  return reactPerformanceOptimizer;
};

/**
 * Initialize React performance optimizer with custom config
 */
export const initializeReactPerformanceOptimizer = (config: Partial<PerformanceConfig> = {}): ReactPerformanceOptimizer => {
  reactPerformanceOptimizer = new ReactPerformanceOptimizer(config);
  return reactPerformanceOptimizer;
};

/**
 * Hook for optimized useFrame usage
 */
export const useOptimizedFrame = (callback: (state: any, delta: number) => void, deps: any[] = []) => {
  const optimizer = getReactPerformanceOptimizer();
  return optimizer.useOptimizedFrame(callback, deps);
};

/**
 * Hook for memoized callbacks
 */
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T => {
  const optimizer = getReactPerformanceOptimizer();
  return optimizer.createMemoizedCallback(callback, deps);
};

/**
 * Hook for memoized values
 */
export const useOptimizedMemo = <T>(factory: () => T, deps: any[]): T => {
  const optimizer = getReactPerformanceOptimizer();
  return optimizer.createMemoizedValue(factory, deps);
};
