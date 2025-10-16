/**
 * Virtual Scrolling System
 * Dynamically loads/unloads sprites based on scroll position and visibility
 */

import * as THREE from 'three';

export interface VirtualSprite {
  id: string;
  texture: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  alpha: number;
  order: number;
  loaded: boolean;
  visible: boolean;
  priority: 'critical' | 'important' | 'decorative';
  loadDistance: number;
  unloadDistance: number;
}

export interface VirtualScrollConfig {
  enableVirtualScrolling: boolean;
  loadDistance: number;
  unloadDistance: number;
  maxLoadedSprites: number;
  updateInterval: number;
  enableLogging: boolean;
  enablePreloading: boolean;
}

export class VirtualScrollingSystem {
  private virtualSprites = new Map<string, VirtualSprite>();
  private loadedSprites = new Set<string>();
  private loadingQueue: string[] = [];
  private unloadingQueue: string[] = [];
  private camera: THREE.Camera | null = null;
  private config: VirtualScrollConfig;
  private isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  private performanceLog: Array<{timestamp: number, action: string, details: any}> = [];
  private lastUpdateTime = 0;
  private scrollStats = {
    totalUpdates: 0,
    spritesLoaded: 0,
    spritesUnloaded: 0,
    averageUpdateTime: 0
  };

  constructor(config: Partial<VirtualScrollConfig> = {}) {
    this.config = {
      enableVirtualScrolling: true,
      loadDistance: this.isMobile ? 30 : 50, // Shorter distance on mobile
      unloadDistance: this.isMobile ? 60 : 100, // Shorter distance on mobile
      maxLoadedSprites: this.isMobile ? 50 : 100, // Fewer sprites on mobile
      updateInterval: this.isMobile ? 200 : 100, // Less frequent updates on mobile
      enableLogging: true,
      enablePreloading: true,
      ...config
    };

    this.log('VirtualScrollingSystem initialized', { 
      config: this.config,
      isMobile: this.isMobile 
    });
  }

  /**
   * Set camera for distance calculations
   */
  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
    this.log('Camera set for virtual scrolling', { 
      cameraType: camera.constructor.name 
    });
  }

  /**
   * Add virtual sprite
   */
  addVirtualSprite(
    id: string,
    texture: string,
    position: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0],
    scale: [number, number, number] = [1, 1, 1],
    alpha: number = 1,
    order: number = 1,
    priority: 'critical' | 'important' | 'decorative' = 'decorative'
  ): void {
    const virtualSprite: VirtualSprite = {
      id,
      texture,
      position,
      rotation,
      scale,
      alpha,
      order,
      loaded: false,
      visible: false,
      priority,
      loadDistance: this.getLoadDistance(priority),
      unloadDistance: this.getUnloadDistance(priority)
    };

    this.virtualSprites.set(id, virtualSprite);
    this.log('Virtual sprite added', { id, texture, position, priority });
  }

  /**
   * Remove virtual sprite
   */
  removeVirtualSprite(id: string): void {
    const sprite = this.virtualSprites.get(id);
    if (!sprite) return;

    // Unload if loaded
    if (sprite.loaded) {
      this.unloadSprite(id);
    }

    this.virtualSprites.delete(id);
    this.log('Virtual sprite removed', { id });
  }

  /**
   * Update virtual scrolling
   */
  updateVirtualScrolling(): void {
    if (!this.config.enableVirtualScrolling || !this.camera) {
      return;
    }

    const currentTime = performance.now();
    if (currentTime - this.lastUpdateTime < this.config.updateInterval) {
      return;
    }

    const startTime = performance.now();
    this.scrollStats.totalUpdates++;

    // Process loading queue
    this.processLoadingQueue();
    
    // Process unloading queue
    this.processUnloadingQueue();

    // Update sprite visibility based on distance
    this.updateSpriteVisibility();

    // Update statistics
    const updateTime = performance.now() - startTime;
    this.scrollStats.averageUpdateTime = (this.scrollStats.averageUpdateTime + updateTime) / 2;
    this.lastUpdateTime = currentTime;

    // Log performance every 50 updates
    if (this.scrollStats.totalUpdates % 50 === 0) {
      this.log('Virtual scrolling performance', {
        totalUpdates: this.scrollStats.totalUpdates,
        loadedSprites: this.loadedSprites.size,
        totalSprites: this.virtualSprites.size,
        averageUpdateTime: `${this.scrollStats.averageUpdateTime.toFixed(2)}ms`,
        loadingQueue: this.loadingQueue.length,
        unloadingQueue: this.unloadingQueue.length
      });
    }
  }

  /**
   * Update sprite visibility based on camera distance
   */
  private updateSpriteVisibility(): void {
    if (!this.camera) return;

    this.virtualSprites.forEach((sprite, id) => {
      const distance = this.camera!.position.distanceTo(new THREE.Vector3(...sprite.position));
      
      // Check if sprite should be loaded
      if (!sprite.loaded && distance <= sprite.loadDistance) {
        this.loadingQueue.push(id);
      }
      
      // Check if sprite should be unloaded
      if (sprite.loaded && distance > sprite.unloadDistance) {
        this.unloadingQueue.push(id);
      }
    });
  }

  /**
   * Process loading queue
   */
  private processLoadingQueue(): void {
    // Sort by priority and distance
    const sortedQueue = this.loadingQueue.sort((a, b) => {
      const spriteA = this.virtualSprites.get(a)!;
      const spriteB = this.virtualSprites.get(b)!;
      
      // Priority order: critical > important > decorative
      const priorityOrder = { critical: 0, important: 1, decorative: 2 };
      const priorityDiff = priorityOrder[spriteA.priority] - priorityOrder[spriteB.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by distance
      const distanceA = this.camera ? this.camera.position.distanceTo(new THREE.Vector3(...spriteA.position)) : 0;
      const distanceB = this.camera ? this.camera.position.distanceTo(new THREE.Vector3(...spriteB.position)) : 0;
      
      return distanceA - distanceB;
    });

    // Load sprites up to max limit
    const maxToLoad = Math.min(sortedQueue.length, this.config.maxLoadedSprites - this.loadedSprites.size);
    
    for (let i = 0; i < maxToLoad; i++) {
      const id = sortedQueue[i];
      this.loadSprite(id);
    }

    // Clear processed items
    this.loadingQueue = sortedQueue.slice(maxToLoad);
  }

  /**
   * Process unloading queue
   */
  private processUnloadingQueue(): void {
    this.unloadingQueue.forEach(id => {
      this.unloadSprite(id);
    });
    
    this.unloadingQueue = [];
  }

  /**
   * Load sprite
   */
  private loadSprite(id: string): void {
    const sprite = this.virtualSprites.get(id);
    if (!sprite || sprite.loaded) return;

    sprite.loaded = true;
    sprite.visible = true;
    this.loadedSprites.add(id);
    this.scrollStats.spritesLoaded++;

    this.log('Sprite loaded', { id, texture: sprite.texture, position: sprite.position });
  }

  /**
   * Unload sprite
   */
  private unloadSprite(id: string): void {
    const sprite = this.virtualSprites.get(id);
    if (!sprite || !sprite.loaded) return;

    sprite.loaded = false;
    sprite.visible = false;
    this.loadedSprites.delete(id);
    this.scrollStats.spritesUnloaded++;

    this.log('Sprite unloaded', { id, texture: sprite.texture });
  }

  /**
   * Get load distance based on priority
   */
  private getLoadDistance(priority: 'critical' | 'important' | 'decorative'): number {
    switch (priority) {
      case 'critical': return this.config.loadDistance * 1.5;
      case 'important': return this.config.loadDistance;
      case 'decorative': return this.config.loadDistance * 0.7;
      default: return this.config.loadDistance;
    }
  }

  /**
   * Get unload distance based on priority
   */
  private getUnloadDistance(priority: 'critical' | 'important' | 'decorative'): number {
    switch (priority) {
      case 'critical': return this.config.unloadDistance * 1.5;
      case 'important': return this.config.unloadDistance;
      case 'decorative': return this.config.unloadDistance * 0.8;
      default: return this.config.unloadDistance;
    }
  }

  /**
   * Get loaded sprites
   */
  getLoadedSprites(): VirtualSprite[] {
    return Array.from(this.virtualSprites.values()).filter(sprite => sprite.loaded);
  }

  /**
   * Get visible sprites
   */
  getVisibleSprites(): VirtualSprite[] {
    return Array.from(this.virtualSprites.values()).filter(sprite => sprite.visible);
  }

  /**
   * Get sprite by ID
   */
  getSprite(id: string): VirtualSprite | null {
    return this.virtualSprites.get(id) || null;
  }

  /**
   * Update sprite position
   */
  updateSpritePosition(id: string, position: [number, number, number]): void {
    const sprite = this.virtualSprites.get(id);
    if (!sprite) return;

    sprite.position = position;
    this.log('Sprite position updated', { id, position });
  }

  /**
   * Get virtual scrolling statistics
   */
  getVirtualScrollStats(): {
    totalSprites: number;
    loadedSprites: number;
    visibleSprites: number;
    loadingQueue: number;
    unloadingQueue: number;
    maxLoadedSprites: number;
    averageUpdateTime: number;
    totalUpdates: number;
  } {
    const visibleSprites = this.getVisibleSprites().length;
    
    return {
      totalSprites: this.virtualSprites.size,
      loadedSprites: this.loadedSprites.size,
      visibleSprites,
      loadingQueue: this.loadingQueue.length,
      unloadingQueue: this.unloadingQueue.length,
      maxLoadedSprites: this.config.maxLoadedSprites,
      averageUpdateTime: this.scrollStats.averageUpdateTime,
      totalUpdates: this.scrollStats.totalUpdates
    };
  }

  /**
   * Enable/disable virtual scrolling
   */
  setVirtualScrollingEnabled(enabled: boolean): void {
    this.config.enableVirtualScrolling = enabled;
    this.log('Virtual scrolling enabled/disabled', { enabled });
  }

  /**
   * Set max loaded sprites
   */
  setMaxLoadedSprites(maxSprites: number): void {
    this.config.maxLoadedSprites = maxSprites;
    this.log('Max loaded sprites updated', { maxSprites });
  }

  /**
   * Clear all virtual sprites
   */
  clearAll(): void {
    // Unload all loaded sprites
    this.loadedSprites.forEach(id => {
      this.unloadSprite(id);
    });

    this.virtualSprites.clear();
    this.loadedSprites.clear();
    this.loadingQueue = [];
    this.unloadingQueue = [];
    
    this.scrollStats = {
      totalUpdates: 0,
      spritesLoaded: 0,
      spritesUnloaded: 0,
      averageUpdateTime: 0
    };
    
    this.log('All virtual sprites cleared');
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
    console.log(`${emoji} [VirtualScrolling] ${action}`, details);
  }

  /**
   * Export performance data
   */
  exportPerformanceData(): string {
    const data = {
      stats: this.getVirtualScrollStats(),
      config: this.config,
      log: this.performanceLog,
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }
}

// Singleton instance
let virtualScrollingSystem: VirtualScrollingSystem | null = null;

/**
 * Get the virtual scrolling system instance
 */
export const getVirtualScrollingSystem = (): VirtualScrollingSystem => {
  if (!virtualScrollingSystem) {
    virtualScrollingSystem = new VirtualScrollingSystem();
  }
  return virtualScrollingSystem;
};

/**
 * Initialize virtual scrolling system
 */
export const initializeVirtualScrollingSystem = (config?: Partial<VirtualScrollConfig>): VirtualScrollingSystem => {
  virtualScrollingSystem = new VirtualScrollingSystem(config);
  return virtualScrollingSystem;
};
