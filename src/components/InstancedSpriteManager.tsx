/**
 * Instanced Sprite Manager
 * Manages all instanced sprites and optimization systems
 */

import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { getInstancedRenderingSystem } from '../utils/InstancedRenderingSystem';
import { getFrustumCullingSystem } from '../utils/FrustumCullingSystem';
import { getVirtualScrollingSystem } from '../utils/VirtualScrollingSystem';
import { getEnhancedPerformanceMonitor } from '../utils/EnhancedPerformanceMonitor';
import { useOptimizedFrame } from '../utils/ReactPerformanceOptimizer';

interface InstancedSpriteManagerProps {
  enableInstancedRendering?: boolean;
  enableFrustumCulling?: boolean;
  enableVirtualScrolling?: boolean;
  enablePerformanceMonitoring?: boolean;
  updateInterval?: number;
}

export const InstancedSpriteManager: React.FC<InstancedSpriteManagerProps> = ({
  enableInstancedRendering = true,
  enableFrustumCulling = true,
  enableVirtualScrolling = true,
  enablePerformanceMonitoring = true,
  updateInterval = 16 // ~60fps
}) => {
  const { camera } = useThree();
  const lastUpdateTime = useRef(0);
  
  // Get optimization systems
  const instancedSystem = getInstancedRenderingSystem();
  const frustumSystem = getFrustumCullingSystem();
  const virtualSystem = getVirtualScrollingSystem();
  const performanceMonitor = getEnhancedPerformanceMonitor();

  // Initialize systems
  useEffect(() => {
    if (camera) {
      frustumSystem.setCamera(camera);
      virtualSystem.setCamera(camera);
    }

    // Start performance monitoring
    if (enablePerformanceMonitoring) {
      performanceMonitor.startMonitoring();
    }

    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const emoji = isMobile ? '📱' : '🖥️';
    console.log(`${emoji} [InstancedSpriteManager] Optimization systems initialized`, {
      instancedRendering: enableInstancedRendering,
      frustumCulling: enableFrustumCulling,
      virtualScrolling: enableVirtualScrolling,
      performanceMonitoring: enablePerformanceMonitoring
    });

    return () => {
      if (enablePerformanceMonitoring) {
        performanceMonitor.stopMonitoring();
      }
    };
  }, [camera, enableInstancedRendering, enableFrustumCulling, enableVirtualScrolling, enablePerformanceMonitoring, frustumSystem, virtualSystem, performanceMonitor]);

  // Optimized main update loop with performance optimizations
  useOptimizedFrame(() => {
    const currentTime = performance.now();
    
    // Throttle updates based on interval
    if (currentTime - lastUpdateTime.current < updateInterval) {
      return;
    }

    // Update frustum culling
    if (enableFrustumCulling) {
      frustumSystem.performCulling();
    }

    // Update virtual scrolling
    if (enableVirtualScrolling) {
      virtualSystem.updateVirtualScrolling();
    }

    // Update instanced rendering
    if (enableInstancedRendering) {
      instancedSystem.updateInstancedMeshes();
    }

    lastUpdateTime.current = currentTime;
  }, [enableInstancedRendering, enableFrustumCulling, enableVirtualScrolling, updateInterval, frustumSystem, virtualSystem, instancedSystem]);

  // Render all instanced meshes
  return (
    <group>
      {enableInstancedRendering && instancedSystem.getInstancedMeshes().map((mesh, index) => (
        <primitive key={`instanced-mesh-${index}`} object={mesh} />
      ))}
    </group>
  );
};

export default InstancedSpriteManager;
