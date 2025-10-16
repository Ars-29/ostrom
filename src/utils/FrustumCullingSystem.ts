/**
 * Frustum Culling System
 * Only renders objects that are visible in the camera's view frustum
 */

import * as THREE from 'three';

export interface CullableObject {
  id: string;
  position: [number, number, number];
  boundingBox: THREE.Box3;
  visible: boolean;
  lastCullTime: number;
  cullCount: number;
}

export interface FrustumCullerConfig {
  enableCulling: boolean;
  cullDistance: number;
  updateInterval: number; // ms
  enableLogging: boolean;
  enableDebug: boolean;
}

export class FrustumCullingSystem {
  private cullableObjects = new Map<string, CullableObject>();
  private frustum = new THREE.Frustum();
  private cameraMatrix = new THREE.Matrix4();
  private camera: THREE.Camera | null = null;
  private config: FrustumCullerConfig;
  private isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  private performanceLog: Array<{timestamp: number, action: string, details: any}> = [];
  private cullStats = {
    totalCulls: 0,
    visibleObjects: 0,
    culledObjects: 0,
    averageCullTime: 0
  };

  constructor(config: Partial<FrustumCullerConfig> = {}) {
    this.config = {
      enableCulling: true,
      cullDistance: this.isMobile ? 50 : 100, // Shorter distance on mobile
      updateInterval: this.isMobile ? 100 : 50, // Less frequent updates on mobile
      enableLogging: true,
      enableDebug: false,
      ...config
    };

    this.log('FrustumCullingSystem initialized', { 
      config: this.config,
      isMobile: this.isMobile 
    });
  }

  /**
   * Set camera for frustum calculations
   */
  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
    this.log('Camera set for frustum culling', { 
      cameraType: camera.constructor.name 
    });
  }

  /**
   * Add object to culling system
   */
  addObject(
    id: string, 
    position: [number, number, number], 
    size: [number, number, number] = [1, 1, 1]
  ): void {
    const boundingBox = new THREE.Box3(
      new THREE.Vector3(position[0] - size[0]/2, position[1] - size[1]/2, position[2] - size[2]/2),
      new THREE.Vector3(position[0] + size[0]/2, position[1] + size[1]/2, position[2] + size[2]/2)
    );

    const cullableObject: CullableObject = {
      id,
      position,
      boundingBox,
      visible: true,
      lastCullTime: 0,
      cullCount: 0
    };

    this.cullableObjects.set(id, cullableObject);
    this.log('Object added to culling system', { id, position, size });
  }

  /**
   * Remove object from culling system
   */
  removeObject(id: string): void {
    if (this.cullableObjects.delete(id)) {
      this.log('Object removed from culling system', { id });
    }
  }

  /**
   * Update object position
   */
  updateObjectPosition(id: string, position: [number, number, number]): void {
    const obj = this.cullableObjects.get(id);
    if (!obj) return;

    obj.position = position;
    
    // Update bounding box
    const size = [
      obj.boundingBox.max.x - obj.boundingBox.min.x,
      obj.boundingBox.max.y - obj.boundingBox.min.y,
      obj.boundingBox.max.z - obj.boundingBox.min.z
    ];

    obj.boundingBox.setFromCenterAndSize(
      new THREE.Vector3(...position),
      new THREE.Vector3(...size)
    );

    this.log('Object position updated', { id, position });
  }

  /**
   * Perform frustum culling
   */
  performCulling(): { visible: string[], culled: string[] } {
    if (!this.config.enableCulling || !this.camera) {
      return { visible: Array.from(this.cullableObjects.keys()), culled: [] };
    }

    const startTime = performance.now();
    const visible: string[] = [];
    const culled: string[] = [];

    // Update camera matrices
    this.camera.updateMatrixWorld();
    if ('updateProjectionMatrix' in this.camera) {
      (this.camera as any).updateProjectionMatrix();
    }
    
    // Calculate frustum
    this.cameraMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.cameraMatrix);

    // Cull each object
    this.cullableObjects.forEach((obj, id) => {
      const isVisible = this.isObjectVisible(obj);
      
      if (isVisible) {
        obj.visible = true;
        visible.push(id);
      } else {
        obj.visible = false;
        culled.push(id);
      }

      obj.lastCullTime = performance.now();
      obj.cullCount++;
    });

    // Update statistics
    const cullTime = performance.now() - startTime;
    this.cullStats.totalCulls++;
    this.cullStats.visibleObjects = visible.length;
    this.cullStats.culledObjects = culled.length;
    this.cullStats.averageCullTime = (this.cullStats.averageCullTime + cullTime) / 2;

    // Log performance every 100 culls
    if (this.cullStats.totalCulls % 100 === 0) {
      this.log('Culling performance', {
        totalCulls: this.cullStats.totalCulls,
        visibleObjects: this.cullStats.visibleObjects,
        culledObjects: this.cullStats.culledObjects,
        averageCullTime: `${this.cullStats.averageCullTime.toFixed(2)}ms`,
        cullRatio: `${(this.cullStats.culledObjects / this.cullableObjects.size * 100).toFixed(1)}%`
      });
    }

    return { visible, culled };
  }

  /**
   * Check if object is visible in frustum
   */
  private isObjectVisible(obj: CullableObject): boolean {
    // Check if object is within cull distance
    if (this.camera) {
      const distance = this.camera.position.distanceTo(new THREE.Vector3(...obj.position));
      if (distance > this.config.cullDistance) {
        return false;
      }
    }

    // Check frustum intersection
    return this.frustum.intersectsBox(obj.boundingBox);
  }

  /**
   * Get visible objects
   */
  getVisibleObjects(): string[] {
    return Array.from(this.cullableObjects.entries())
      .filter(([_, obj]) => obj.visible)
      .map(([id, _]) => id);
  }

  /**
   * Get culled objects
   */
  getCulledObjects(): string[] {
    return Array.from(this.cullableObjects.entries())
      .filter(([_, obj]) => !obj.visible)
      .map(([id, _]) => id);
  }

  /**
   * Check if object is visible
   */
  isObjectVisibleById(id: string): boolean {
    const obj = this.cullableObjects.get(id);
    return obj ? obj.visible : false;
  }

  /**
   * Get culling statistics
   */
  getCullingStats(): {
    totalObjects: number;
    visibleObjects: number;
    culledObjects: number;
    cullRatio: number;
    averageCullTime: number;
    totalCulls: number;
  } {
    const totalObjects = this.cullableObjects.size;
    const visibleObjects = this.getVisibleObjects().length;
    const culledObjects = this.getCulledObjects().length;
    const cullRatio = totalObjects > 0 ? (culledObjects / totalObjects) * 100 : 0;

    return {
      totalObjects,
      visibleObjects,
      culledObjects,
      cullRatio,
      averageCullTime: this.cullStats.averageCullTime,
      totalCulls: this.cullStats.totalCulls
    };
  }

  /**
   * Enable/disable culling
   */
  setCullingEnabled(enabled: boolean): void {
    this.config.enableCulling = enabled;
    this.log('Culling enabled/disabled', { enabled });
  }

  /**
   * Set cull distance
   */
  setCullDistance(distance: number): void {
    this.config.cullDistance = distance;
    this.log('Cull distance updated', { distance });
  }

  /**
   * Clear all objects
   */
  clearAll(): void {
    this.cullableObjects.clear();
    this.cullStats = {
      totalCulls: 0,
      visibleObjects: 0,
      culledObjects: 0,
      averageCullTime: 0
    };
    this.log('All objects cleared from culling system');
  }

  /**
   * Get debug information
   */
  getDebugInfo(): {
    camera: THREE.Camera | null;
    frustum: THREE.Frustum;
    config: FrustumCullerConfig;
    objectCount: number;
  } {
    return {
      camera: this.camera,
      frustum: this.frustum,
      config: this.config,
      objectCount: this.cullableObjects.size
    };
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
      deviceType: this.isMobile ? 'mobile' : 'desktop'
    };

    this.performanceLog.push(logEntry);

    // Keep only last 100 log entries
    if (this.performanceLog.length > 100) {
      this.performanceLog.shift();
    }

    // Console logging with emojis
    const emoji = this.isMobile ? '📱' : '🖥️';
    console.log(`${emoji} [FrustumCulling] ${action}`, details);
  }

  /**
   * Export performance data
   */
  exportPerformanceData(): string {
    const data = {
      stats: this.getCullingStats(),
      config: this.config,
      log: this.performanceLog,
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }
}

// Singleton instance
let frustumCullingSystem: FrustumCullingSystem | null = null;

/**
 * Get the frustum culling system instance
 */
export const getFrustumCullingSystem = (): FrustumCullingSystem => {
  if (!frustumCullingSystem) {
    frustumCullingSystem = new FrustumCullingSystem();
  }
  return frustumCullingSystem;
};

/**
 * Initialize frustum culling system
 */
export const initializeFrustumCullingSystem = (config?: Partial<FrustumCullerConfig>): FrustumCullingSystem => {
  frustumCullingSystem = new FrustumCullingSystem(config);
  return frustumCullingSystem;
};
