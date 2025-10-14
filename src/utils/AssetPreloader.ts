// src/utils/AssetPreloader.ts
interface AssetPreloaderOptions {
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

interface PreloadAsset {
  src: string;
  type: 'image' | 'font' | 'video' | 'audio';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export class AssetPreloader {
  private assets: PreloadAsset[] = [];
  private loadedAssets = 0;
  private totalAssets = 0;
  private options: AssetPreloaderOptions;

  constructor(options: AssetPreloaderOptions = {}) {
    this.options = options;
  }

  addAsset(asset: PreloadAsset): void {
    this.assets.push(asset);
  }

  addAssets(assets: PreloadAsset[]): void {
    this.assets.push(...assets);
  }

  async preload(): Promise<void> {
    console.log('🔄 [AssetPreloader] Starting preload process...');
    
    // Sort assets by priority
    const sortedAssets = this.assets.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    this.totalAssets = sortedAssets.length;
    this.loadedAssets = 0;
    
    console.log(`📊 [AssetPreloader] Total assets to load: ${this.totalAssets}`);
    console.log('📋 [AssetPreloader] Asset priority breakdown:', {
      critical: sortedAssets.filter(a => a.priority === 'critical').length,
      high: sortedAssets.filter(a => a.priority === 'high').length,
      medium: sortedAssets.filter(a => a.priority === 'medium').length,
      low: sortedAssets.filter(a => a.priority === 'low').length,
    });

    // Load assets in batches by priority
    const criticalAssets = sortedAssets.filter(a => a.priority === 'critical');
    const highAssets = sortedAssets.filter(a => a.priority === 'high');
    const mediumAssets = sortedAssets.filter(a => a.priority === 'medium');
    const lowAssets = sortedAssets.filter(a => a.priority === 'low');

    try {
      // Load critical assets first
      if (criticalAssets.length > 0) {
        console.log(`🚨 [AssetPreloader] Loading ${criticalAssets.length} critical assets...`);
        const criticalStartTime = performance.now();
        await this.loadAssetBatch(criticalAssets);
        const criticalEndTime = performance.now();
        console.log(`✅ [AssetPreloader] Critical assets loaded in ${(criticalEndTime - criticalStartTime).toFixed(2)}ms`);
      }

      // Load high priority assets
      if (highAssets.length > 0) {
        console.log(`⚡ [AssetPreloader] Loading ${highAssets.length} high priority assets...`);
        const highStartTime = performance.now();
        await this.loadAssetBatch(highAssets);
        const highEndTime = performance.now();
        console.log(`✅ [AssetPreloader] High priority assets loaded in ${(highEndTime - highStartTime).toFixed(2)}ms`);
      }

      // Load medium and low priority assets in background
      const backgroundAssets = [...mediumAssets, ...lowAssets];
      if (backgroundAssets.length > 0) {
        console.log(`🔄 [AssetPreloader] Starting background loading of ${backgroundAssets.length} assets...`);
        this.loadAssetBatch(backgroundAssets); // Don't await - load in background
      }

      console.log('🎉 [AssetPreloader] All priority assets loaded successfully!');
      this.options.onComplete?.();
    } catch (error) {
      console.error('❌ [AssetPreloader] Error during preload:', error);
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  private async loadAssetBatch(assets: PreloadAsset[]): Promise<void> {
    const promises = assets.map(asset => this.loadSingleAsset(asset));
    await Promise.all(promises);
  }

  private async loadSingleAsset(asset: PreloadAsset): Promise<void> {
    return new Promise((resolve, reject) => {
      switch (asset.type) {
        case 'image':
          this.loadImage(asset.src).then(resolve).catch(reject);
          break;
        case 'font':
          this.loadFont(asset.src).then(resolve).catch(reject);
          break;
        case 'video':
          this.loadVideo(asset.src).then(resolve).catch(reject);
          break;
        case 'audio':
          this.loadAudio(asset.src).then(resolve).catch(reject);
          break;
        default:
          resolve();
      }
    });
  }

  private async loadImage(src: string): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const img = new Image();
      img.onload = () => {
        const loadTime = performance.now() - startTime;
        console.log(`🖼️ [AssetPreloader] Image loaded: ${src} (${loadTime.toFixed(2)}ms)`);
        this.updateProgress();
        resolve();
      };
      img.onerror = () => {
        console.warn(`⚠️ [AssetPreloader] Failed to load image: ${src}`);
        this.updateProgress();
        resolve(); // Don't reject - continue loading other assets
      };
      img.src = src;
    });
  }

  private async loadFont(src: string): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const font = new FontFace('CustomFont', `url(${src})`);
      font.load().then(() => {
        const loadTime = performance.now() - startTime;
        console.log(`🔤 [AssetPreloader] Font loaded: ${src} (${loadTime.toFixed(2)}ms)`);
        document.fonts.add(font);
        this.updateProgress();
        resolve();
      }).catch(() => {
        console.warn(`⚠️ [AssetPreloader] Failed to load font: ${src}`);
        this.updateProgress();
        resolve();
      });
    });
  }

  private async loadVideo(src: string): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const loadTime = performance.now() - startTime;
        console.log(`🎥 [AssetPreloader] Video metadata loaded: ${src} (${loadTime.toFixed(2)}ms)`);
        this.updateProgress();
        resolve();
      };
      video.onerror = () => {
        console.warn(`⚠️ [AssetPreloader] Failed to load video: ${src}`);
        this.updateProgress();
        resolve();
      };
      video.src = src;
    });
  }

  private async loadAudio(src: string): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        const loadTime = performance.now() - startTime;
        console.log(`🔊 [AssetPreloader] Audio metadata loaded: ${src} (${loadTime.toFixed(2)}ms)`);
        this.updateProgress();
        resolve();
      };
      audio.onerror = () => {
        console.warn(`⚠️ [AssetPreloader] Failed to load audio: ${src}`);
        this.updateProgress();
        resolve();
      };
      audio.src = src;
    });
  }

  private updateProgress(): void {
    this.loadedAssets++;
    const progress = (this.loadedAssets / this.totalAssets) * 100;
    console.log(`📊 [AssetPreloader] Progress: ${this.loadedAssets}/${this.totalAssets} (${progress.toFixed(1)}%)`);
    this.options.onProgress?.(progress);
  }

  // Static method for quick preloading
  static async preloadCritical(): Promise<void> {
    const preloader = new AssetPreloader();
    
    // Add critical assets
    preloader.addAssets([
      { src: '/images/logo.svg', type: 'image', priority: 'critical' },
      { src: '/images/background.webp', type: 'image', priority: 'critical' },
      { src: '/images/divider.png', type: 'image', priority: 'critical' },
      { src: '/fonts/bellefair/Bellefair-Regular.woff2', type: 'font', priority: 'critical' },
      { src: '/fonts/playground/PPPlayground-Variable.woff2', type: 'font', priority: 'critical' },
    ]);

    await preloader.preload();
  }
}

export default AssetPreloader;
