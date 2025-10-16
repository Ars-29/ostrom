// Enhanced asset definitions with priority levels
import { getMobileAssetRouter } from './MobileAssetRouter';
const SCENE_ASSETS_ENHANCED = {
  'section-1': {
    critical: [
      'street/floor-firstplan-r.jpg',
      'street/church-thirdplan.webp',
      'street/church_front_1.webp',
      'street/building-secondplan-1_flat.webp'
    ],
    important: [
      'street/building-secondplan-2-1.webp',
      'street/building-secondplan-2-2.webp',
      'street/building-secondplan-2-3.webp',
      'street/building-secondplan-strom.webp',
      'street/sidewalk.jpg',
      'street/streetlamp-secondplan.webp'
    ],
    decorative: [
      'street/car-secondplan-1.webp',
      'street/horse_1.webp',
      'street/car-secondplan-2.webp',
      'street/car-secondplan-3.webp',
      'street/motocycle.webp',
      'street/voiture-chien.webp',
      'street/man-thirdplan-1.webp',
      'street/man-thirdplan-2.webp',
      'street/men-thirdplan.webp',
      'street/man-secondplan-1.webp',
      'street/man-secondplan-2.webp',
      'street/man-secondplan-7.webp',
      'street/man-secondplan-4.webp',
      'street/man-secondplan-6.webp',
      'street/man-secondplan-5.webp',
      'street/man-car.webp',
      'street/man-secondplan-3.webp',
      'street/man-secondplan-8.webp',
      'street/man-secondplan-9.webp',
      'street/man-secondplan-10.webp',
      'street/man-secondplan-11.webp',
      'street/man-secondplan-12.webp',
      'street/man-secondplan-13.webp',
      'street/dog-1.webp',
      'street/floor-firstplan-r_displacement.jpg'
    ]
  },
  'section-2': {
    critical: [
      'road/road_1.jpg',
      'road/road_2.jpg',
      'road/road_3.jpg',
      'road/road_4.jpg'
    ],
    important: [
      'road/road_1_height.webp',
      'road/road_2_height.webp',
      'road/road_3_height.webp',
      'road/road_4_height.webp'
    ],
    decorative: [
      'road/hotairbaloon.webp',
      'road/hotairbaloon_color.webp'
    ]
  },
  'section-3': {
    critical: [
      'plane/floor-firstplan-r.jpg',
      'floor_heightmap.png',
      'plane/background-r.jpg',
      'plane/third-plan.webp',
      'plane/second-plan.webp',
      'plane/plane.webp',
      'plane/plane_end.webp'
    ],
    important: [
      'plane/plane_color.webp',
      'plane/people_1.webp',
      'plane/people_2.webp',
      'plane/people_3.webp',
      'plane/people_4.webp',
      'plane/people_5.webp',
      'plane/people_6.webp',
      'plane/pilot.webp',
      'plane/poi/pub.webp',
      'plane/poi/1909.webp',
      'plane/poi/1911.webp',
      'plane/poi/1912.webp'
    ],
    decorative: [
      'plane/people_3_color.webp',
      'plane/pilot_color.webp'
    ]
  }
};

// Scroll direction detection
enum ScrollDirection {
  UP = 'up',
  DOWN = 'down',
  STATIONARY = 'stationary'
}

// Enhanced Scene Asset Preloader with intelligent loading
export class EnhancedSceneAssetPreloader {
  private loadedAssets = new Set<string>();
  private preloadQueue = new Map<string, Promise<void>>();
  private loadingStates = new Map<string, 'loading' | 'loaded' | 'error'>();
  private scrollDirection: ScrollDirection = ScrollDirection.STATIONARY;
  private lastScrollY = 0;
  // private assetRouter = getMobileAssetRouter(); // Temporarily disabled
  private assetRouter = getMobileAssetRouter(); // Re-enabled with fallback support
  private scrollVelocity = 0;
  private preloadDistance = 2; // Preload 2 sections ahead

  constructor() {
    this.setupScrollTracking();
  }

  private setupScrollTracking() {
    let lastTime = performance.now();
    
    const trackScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      // Calculate scroll velocity
      this.scrollVelocity = (currentScrollY - this.lastScrollY) / deltaTime;
      
      // Determine scroll direction
      if (Math.abs(this.scrollVelocity) < 0.1) {
        this.scrollDirection = ScrollDirection.STATIONARY;
      } else if (this.scrollVelocity > 0) {
        this.scrollDirection = ScrollDirection.DOWN;
      } else {
        this.scrollDirection = ScrollDirection.UP;
      }
      
      this.lastScrollY = currentScrollY;
      lastTime = currentTime;
      
      // Adjust preload distance based on scroll speed
      this.preloadDistance = Math.min(3, Math.max(1, Math.ceil(Math.abs(this.scrollVelocity) * 100)));
    };

    window.addEventListener('scroll', trackScroll, { passive: true });
  }

  async preloadSceneAssets(sceneId: string, priority: 'critical' | 'important' | 'decorative' = 'critical'): Promise<void> {
    const sceneAssets = SCENE_ASSETS_ENHANCED[sceneId as keyof typeof SCENE_ASSETS_ENHANCED];
    if (!sceneAssets) return;

    const assets = sceneAssets[priority];
    if (!assets || assets.length === 0) return;

    const startTime = performance.now();
    console.log(`🔄 [EnhancedPreloader] Preloading ${priority} assets for scene: ${sceneId}`);
    console.log(`📦 [EnhancedPreloader] Assets to load: ${assets.length}`);

    const loadPromises = assets.map(asset => this.loadAsset(asset, priority));
    await Promise.all(loadPromises);

    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`✅ [EnhancedPreloader] ${priority} assets preloaded for scene: ${sceneId}`);
    console.log(`⏱️ [EnhancedPreloader] Load duration: ${duration.toFixed(2)}ms`);
    console.log(`📊 [EnhancedPreloader] Average per asset: ${(duration / assets.length).toFixed(2)}ms`);
  }

  async preloadAdjacentScenes(currentScene: string): Promise<void> {
    const sceneOrder = ['intro', 'section-1', 'section-2', 'section-3', 'footer'];
    const currentIndex = sceneOrder.indexOf(currentScene);
    
    if (currentIndex === -1) return;

    console.log(`🚀 [EnhancedPreloader] Preloading adjacent scenes for: ${currentScene} (direction: ${this.scrollDirection})`);

    // Determine which scenes to preload based on scroll direction and speed
    const scenesToPreload: string[] = [];
    
    if (this.scrollDirection === ScrollDirection.DOWN) {
      // Scrolling down - preload upcoming scenes
      for (let i = 1; i <= this.preloadDistance; i++) {
        const nextIndex = currentIndex + i;
        if (nextIndex < sceneOrder.length) {
          scenesToPreload.push(sceneOrder[nextIndex]);
        }
      }
    } else if (this.scrollDirection === ScrollDirection.UP) {
      // Scrolling up - preload previous scenes
      for (let i = 1; i <= this.preloadDistance; i++) {
        const prevIndex = currentIndex - i;
        if (prevIndex >= 0) {
          scenesToPreload.push(sceneOrder[prevIndex]);
        }
      }
    } else {
      // Stationary - preload both directions
      for (let i = 1; i <= Math.ceil(this.preloadDistance / 2); i++) {
        const nextIndex = currentIndex + i;
        const prevIndex = currentIndex - i;
        
        if (nextIndex < sceneOrder.length) {
          scenesToPreload.push(sceneOrder[nextIndex]);
        }
        if (prevIndex >= 0) {
          scenesToPreload.push(sceneOrder[prevIndex]);
        }
      }
    }

    // Preload scenes in priority order
    for (const sceneId of scenesToPreload) {
      if (sceneId !== 'intro' && sceneId !== 'footer') {
        // Load critical assets first
        await this.preloadSceneAssets(sceneId, 'critical');
        
        // Load important assets if scroll speed is moderate
        if (Math.abs(this.scrollVelocity) < 2) {
          await this.preloadSceneAssets(sceneId, 'important');
        }
        
        // Load decorative assets only if scroll is slow
        if (Math.abs(this.scrollVelocity) < 0.5) {
          await this.preloadSceneAssets(sceneId, 'decorative');
        }
      }
    }
  }

  private async loadAsset(assetPath: string, priority: string): Promise<void> {
    if (this.loadedAssets.has(assetPath)) {
      return;
    }

    if (this.preloadQueue.has(assetPath)) {
      return this.preloadQueue.get(assetPath);
    }

    // Get optimized asset path using mobile asset router with fallback
    const optimizedPath = this.assetRouter.getAssetPath(`images/${assetPath}`);

    const loadPromise = new Promise<void>((resolve) => {
      this.loadingStates.set(assetPath, 'loading');
      
      const startTime = performance.now();
      const img = new Image();
      
      // Add retry logic for failed assets
      let retryCount = 0;
      const maxRetries = 3;
      
      const attemptLoad = () => {
        img.onload = () => {
          const endTime = performance.now();
          const loadTime = endTime - startTime;
          
          this.loadedAssets.add(assetPath);
          this.loadingStates.set(assetPath, 'loaded');
          this.preloadQueue.delete(assetPath);
          
          // Log detailed asset loading info with mobile optimization status
          const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const emoji = isMobile ? '📱' : '🖥️';
          console.log(`${emoji} [EnhancedPreloader] ${priority} asset loaded: ${assetPath} -> ${optimizedPath} - ${loadTime.toFixed(2)}ms`);
          console.log(`⏱️ [EnhancedPreloader] Load time: ${loadTime.toFixed(2)}ms`);
          console.log(`📏 [EnhancedPreloader] Dimensions: ${img.width}x${img.height}`);
          
          resolve();
        };
        
        img.onerror = () => {
          const endTime = performance.now();
          const loadTime = endTime - startTime;
          
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.warn(`⚠️ [EnhancedPreloader] Failed to load ${priority} asset (attempt ${retryCount}/${maxRetries}): ${assetPath}`);
            console.warn(`⏱️ [EnhancedPreloader] Failed after: ${loadTime.toFixed(2)}ms - Retrying...`);
            
            // Retry after a short delay
            setTimeout(() => {
              attemptLoad();
            }, 1000 * retryCount); // Exponential backoff
          } else {
            console.error(`❌ [EnhancedPreloader] Failed to load ${priority} asset after ${maxRetries} attempts: ${assetPath}`);
            console.error(`⏱️ [EnhancedPreloader] Final failure after: ${loadTime.toFixed(2)}ms`);
            
            this.loadingStates.set(assetPath, 'error');
            this.preloadQueue.delete(assetPath);
            resolve(); // Continue even if asset fails to load
          }
        };
        
        img.src = `/${optimizedPath}`;
      };
      
      attemptLoad();
    });

    this.preloadQueue.set(assetPath, loadPromise);
    return loadPromise;
  }

  isScenePreloaded(sceneId: string, priority: 'critical' | 'important' | 'decorative' = 'critical'): boolean {
    const sceneAssets = SCENE_ASSETS_ENHANCED[sceneId as keyof typeof SCENE_ASSETS_ENHANCED];
    if (!sceneAssets) return true;
    
    const assets = sceneAssets[priority];
    if (!assets) return true;
    
    return assets.every(asset => this.loadedAssets.has(asset));
  }

  getLoadingState(sceneId: string): 'loading' | 'loaded' | 'partial' | 'error' {
    const sceneAssets = SCENE_ASSETS_ENHANCED[sceneId as keyof typeof SCENE_ASSETS_ENHANCED];
    if (!sceneAssets) return 'loaded';

    const criticalLoaded = this.isScenePreloaded(sceneId, 'critical');
    const importantLoaded = this.isScenePreloaded(sceneId, 'important');
    const decorativeLoaded = this.isScenePreloaded(sceneId, 'decorative');

    if (criticalLoaded && importantLoaded && decorativeLoaded) return 'loaded';
    if (criticalLoaded) return 'partial';
    return 'loading';
  }

  getPreloadStats(): { loaded: number; total: number; percentage: number } {
    const allAssets = Object.values(SCENE_ASSETS_ENHANCED).flatMap(scene => 
      Object.values(scene).flat()
    );
    
    const loadedCount = allAssets.filter(asset => this.loadedAssets.has(asset)).length;
    const totalCount = allAssets.length;
    
    return {
      loaded: loadedCount,
      total: totalCount,
      percentage: totalCount > 0 ? (loadedCount / totalCount) * 100 : 100
    };
  }
}

// Create global enhanced preloader instance
export const enhancedScenePreloader = new EnhancedSceneAssetPreloader();
