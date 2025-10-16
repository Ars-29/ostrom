/**
 * Instanced Rendering System
 * Dramatically reduces draw calls by rendering multiple sprites in a single draw call
 */

import * as THREE from 'three';
import { getMobileAssetRouter } from './MobileAssetRouter';

export interface SpriteInstance {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  texture: string;
  alpha: number;
  visible: boolean;
  order: number;
}

export interface InstancedSpriteGroup {
  texture: string;
  instances: SpriteInstance[];
  maxInstances: number;
  geometry: THREE.PlaneGeometry;
  material: THREE.MeshStandardMaterial;
  instancedMesh: THREE.InstancedMesh | null;
}

export class InstancedRenderingSystem {
  private spriteGroups = new Map<string, InstancedSpriteGroup>();
  private assetRouter = getMobileAssetRouter();
  private isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  private performanceLog: Array<{timestamp: number, action: string, details: any}> = [];

  constructor() {
    this.log('InstancedRenderingSystem initialized', { 
      isMobile: this.isMobile,
      maxGroups: 50 
    });
  }

  /**
   * Create or get sprite group for a specific texture
   */
  createSpriteGroup(texture: string, maxInstances: number = 100): InstancedSpriteGroup {
    const groupId = this.getGroupId(texture);
    
    if (this.spriteGroups.has(groupId)) {
      return this.spriteGroups.get(groupId)!;
    }

    // Get optimized texture path
    const optimizedTexturePath = this.assetRouter.getAssetPath(`images/${texture}`);
    
    // Create geometry (shared for all instances)
    const geometry = new THREE.PlaneGeometry(1, 1);
    
    // Create material
    const material = new THREE.MeshStandardMaterial({
      transparent: true,
      alphaTest: 0.7,
      side: THREE.DoubleSide
    });

    // Load texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(import.meta.env.BASE_URL + optimizedTexturePath, (loadedTexture) => {
      material.map = loadedTexture;
      material.needsUpdate = true;
      this.log('Texture loaded for instanced group', { texture, optimizedTexturePath });
    });

    const group: InstancedSpriteGroup = {
      texture,
      instances: [],
      maxInstances,
      geometry,
      material,
      instancedMesh: null
    };

    this.spriteGroups.set(groupId, group);
    this.log('Sprite group created', { texture, maxInstances, groupId });
    
    return group;
  }

  /**
   * Add sprite instance to a group
   */
  addSpriteInstance(
    texture: string, 
    position: [number, number, number], 
    rotation: [number, number, number], 
    scale: [number, number, number],
    alpha: number = 1,
    order: number = 1
  ): string {
    const groupId = this.getGroupId(texture);
    const group = this.spriteGroups.get(groupId);
    
    if (!group) {
      throw new Error(`Sprite group not found for texture: ${texture}`);
    }

    if (group.instances.length >= group.maxInstances) {
      console.warn(`⚠️ [InstancedRendering] Max instances reached for ${texture}`);
      return '';
    }

    const instanceId = `${groupId}_${group.instances.length}`;
    const instance: SpriteInstance = {
      id: instanceId,
      position,
      rotation,
      scale,
      texture,
      alpha,
      visible: true,
      order
    };

    group.instances.push(instance);
    this.log('Sprite instance added', { instanceId, texture, position });
    
    return instanceId;
  }

  /**
   * Update sprite instance
   */
  updateSpriteInstance(
    instanceId: string, 
    updates: Partial<Pick<SpriteInstance, 'position' | 'rotation' | 'scale' | 'alpha' | 'visible'>>
  ): void {
    const group = this.findGroupByInstanceId(instanceId);
    if (!group) return;

    const instance = group.instances.find(i => i.id === instanceId);
    if (!instance) return;

    Object.assign(instance, updates);
    this.log('Sprite instance updated', { instanceId, updates });
  }

  /**
   * Remove sprite instance
   */
  removeSpriteInstance(instanceId: string): void {
    const group = this.findGroupByInstanceId(instanceId);
    if (!group) return;

    const index = group.instances.findIndex(i => i.id === instanceId);
    if (index !== -1) {
      group.instances.splice(index, 1);
      this.log('Sprite instance removed', { instanceId });
    }
  }

  /**
   * Create instanced mesh for a group
   */
  createInstancedMesh(group: InstancedSpriteGroup): THREE.InstancedMesh {
    if (group.instancedMesh) {
      return group.instancedMesh;
    }

    const instancedMesh = new THREE.InstancedMesh(
      group.geometry,
      group.material,
      group.maxInstances
    );

    // Set render order
    instancedMesh.renderOrder = 1;
    
    group.instancedMesh = instancedMesh;
    this.log('Instanced mesh created', { 
      texture: group.texture, 
      maxInstances: group.maxInstances 
    });

    return instancedMesh;
  }

  /**
   * Update all instanced meshes
   */
  updateInstancedMeshes(): void {
    const startTime = performance.now();
    let totalInstances = 0;

    this.spriteGroups.forEach((group) => {
      if (!group.instancedMesh) {
        this.createInstancedMesh(group);
      }

      const instancedMesh = group.instancedMesh!;
      const matrix = new THREE.Matrix4();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();

      // Update instance matrices
      group.instances.forEach((instance, index) => {
        if (!instance.visible) {
          // Hide instance by scaling to zero
          matrix.makeScale(0, 0, 0);
        } else {
          // Set position, rotation, and scale
          matrix.compose(
            new THREE.Vector3(...instance.position),
            quaternion.setFromEuler(new THREE.Euler(...instance.rotation.map(r => r * Math.PI / 180))),
            scale.set(...instance.scale)
          );
        }

        instancedMesh.setMatrixAt(index, matrix);
        totalInstances++;
      });

      // Mark matrix as needing update
      instancedMesh.instanceMatrix.needsUpdate = true;
      
      // Update instance count
      instancedMesh.count = group.instances.length;
    });

    const duration = performance.now() - startTime;
    this.log('Instanced meshes updated', { 
      totalInstances, 
      groupCount: this.spriteGroups.size,
      duration: `${duration.toFixed(2)}ms`
    });
  }

  /**
   * Get all instanced meshes for rendering
   */
  getInstancedMeshes(): THREE.InstancedMesh[] {
    const meshes: THREE.InstancedMesh[] = [];
    
    this.spriteGroups.forEach((group) => {
      if (group.instancedMesh && group.instances.length > 0) {
        meshes.push(group.instancedMesh);
      }
    });

    return meshes;
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    totalGroups: number;
    totalInstances: number;
    totalDrawCalls: number;
    averageInstancesPerGroup: number;
    memoryUsage: number;
  } {
    let totalInstances = 0;
    let totalDrawCalls = 0;

    this.spriteGroups.forEach((group) => {
      totalInstances += group.instances.length;
      if (group.instances.length > 0) {
        totalDrawCalls += 1; // Each group = 1 draw call
      }
    });

    return {
      totalGroups: this.spriteGroups.size,
      totalInstances,
      totalDrawCalls,
      averageInstancesPerGroup: this.spriteGroups.size > 0 ? totalInstances / this.spriteGroups.size : 0,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    let memoryUsage = 0;
    
    this.spriteGroups.forEach((group) => {
      // Geometry memory (shared)
      memoryUsage += group.geometry.attributes.position.count * 12; // 3 floats * 4 bytes
      
      // Instance matrices memory
      memoryUsage += group.instances.length * 64; // 4x4 matrix * 4 bytes
      
      // Material memory (shared)
      memoryUsage += 1024; // Rough estimate
    });

    return memoryUsage / (1024 * 1024); // Convert to MB
  }

  /**
   * Clear all sprite groups
   */
  clearAll(): void {
    this.spriteGroups.forEach((group) => {
      if (group.instancedMesh) {
        group.instancedMesh.dispose();
      }
      group.geometry.dispose();
      group.material.dispose();
    });
    
    this.spriteGroups.clear();
    this.log('All sprite groups cleared');
  }

  /**
   * Get group ID from texture path
   */
  private getGroupId(texture: string): string {
    return texture.replace(/[^a-zA-Z0-9]/g, '_');
  }

  /**
   * Find group by instance ID
   */
  private findGroupByInstanceId(instanceId: string): InstancedSpriteGroup | null {
    for (const group of this.spriteGroups.values()) {
      if (group.instances.some(i => i.id === instanceId)) {
        return group;
      }
    }
    return null;
  }

  /**
   * Enhanced logging with performance tracking
   */
  private log(action: string, details: any = {}): void {
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
    console.log(`${emoji} [InstancedRendering] ${action}`, details);
  }

  /**
   * Export performance data
   */
  exportPerformanceData(): string {
    const data = {
      stats: this.getPerformanceStats(),
      log: this.performanceLog,
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }
}

// Singleton instance
let instancedRenderingSystem: InstancedRenderingSystem | null = null;

/**
 * Get the instanced rendering system instance
 */
export const getInstancedRenderingSystem = (): InstancedRenderingSystem => {
  if (!instancedRenderingSystem) {
    instancedRenderingSystem = new InstancedRenderingSystem();
  }
  return instancedRenderingSystem;
};

/**
 * Initialize instanced rendering system
 */
export const initializeInstancedRenderingSystem = (): InstancedRenderingSystem => {
  instancedRenderingSystem = new InstancedRenderingSystem();
  return instancedRenderingSystem;
};
