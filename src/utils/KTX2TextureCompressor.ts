/**
 * KTX2 Texture Compression System
 * Implements KTX2/Basis texture compression for ultimate mobile performance
 */

import * as THREE from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

interface KTX2Config {
  enableKTX2Compression: boolean;
  enableFallbackToWebP: boolean;
  enableMobileOptimization: boolean;
  enableTextureAtlas: boolean;
  enableMipmapGeneration: boolean;
  enableAnisotropicFiltering: boolean;
  maxAnisotropy: number;
  enableTextureCaching: boolean;
  enableTexturePreloading: boolean;
}

interface TextureCompressionStats {
  ktx2TexturesLoaded: number;
  webpFallbacks: number;
  compressionRatio: number;
  totalSizeSaved: number;
  averageLoadTime: number;
  cacheHits: number;
  cacheMisses: number;
}

export class KTX2TextureCompressor {
  private config: KTX2Config;
  private stats: TextureCompressionStats;
  private ktx2Loader: KTX2Loader | null = null;
  private textureCache: Map<string, THREE.Texture> = new Map();

  constructor(config: Partial<KTX2Config> = {}) {
    this.config = {
      enableKTX2Compression: true,
      enableFallbackToWebP: true,
      enableMobileOptimization: true,
      enableTextureAtlas: true,
      enableMipmapGeneration: true,
      enableAnisotropicFiltering: true,
      maxAnisotropy: 4,
      enableTextureCaching: true,
      enableTexturePreloading: true,
      ...config
    };

    this.stats = {
      ktx2TexturesLoaded: 0,
      webpFallbacks: 0,
      compressionRatio: 0,
      totalSizeSaved: 0,
      averageLoadTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };

    this.initializeKTX2System();
  }

  /**
   * Initialize KTX2 compression system
   */
  private initializeKTX2System(): void {
    if (typeof window === 'undefined') return;

    // Check for KTX2 support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      console.warn('⚠️ [KTX2Compressor] WebGL not supported, falling back to WebP');
      this.config.enableKTX2Compression = false;
      return;
    }

    // Check for KTX2 extension support
    const ktx2Supported = gl.getExtension('WEBGL_compressed_texture_astc') ||
                         gl.getExtension('WEBGL_compressed_texture_s3tc') ||
                         gl.getExtension('WEBGL_compressed_texture_etc1') ||
                         gl.getExtension('WEBGL_compressed_texture_etc');

    if (!ktx2Supported) {
      console.warn('⚠️ [KTX2Compressor] KTX2 not supported, falling back to WebP');
      this.config.enableKTX2Compression = false;
    } else {
      console.log('✅ [KTX2Compressor] KTX2 compression supported');
    }

    // Initialize loaders
    this.initializeLoaders();

    // Set up texture preloading
    if (this.config.enableTexturePreloading) {
      this.setupTexturePreloading();
    }
  }

  /**
   * Initialize texture loaders
   */
  private initializeLoaders(): void {
    if (this.config.enableKTX2Compression) {
      this.ktx2Loader = new KTX2Loader();
      this.ktx2Loader.setTranscoderPath('/libs/basis/');
      this.ktx2Loader.detectSupport(new THREE.WebGLRenderer());
    }
  }

  /**
   * Set up texture preloading
   */
  private setupTexturePreloading(): void {
    // Preload critical textures
    const criticalTextures = [
      'images/background.webp',
      'images/logo.png',
      'images/mask3.png',
      'images/floor_heightmap.png'
    ];

    criticalTextures.forEach(texturePath => {
      this.preloadTexture(texturePath);
    });
  }

  /**
   * Load texture with KTX2 compression
   */
  async loadCompressedTexture(texturePath: string): Promise<THREE.Texture> {
    const startTime = performance.now();

    // Check cache first
    if (this.config.enableTextureCaching && this.textureCache.has(texturePath)) {
      this.stats.cacheHits++;
      return this.textureCache.get(texturePath)!;
    }

    this.stats.cacheMisses++;

    try {
      let texture: THREE.Texture | null = null;

      // Try KTX2 first
      if (this.config.enableKTX2Compression && this.ktx2Loader) {
        const ktx2Path = this.getKTX2Path(texturePath);
        texture = await this.loadKTX2Texture(ktx2Path);
        
        if (texture) {
          this.stats.ktx2TexturesLoaded++;
          console.log(`✅ [KTX2Compressor] KTX2 texture loaded: ${texturePath}`);
        }
      }

      // Fallback to WebP
      if (!texture && this.config.enableFallbackToWebP) {
        texture = await this.loadWebPTexture(texturePath);
        this.stats.webpFallbacks++;
        console.log(`🔄 [KTX2Compressor] WebP fallback loaded: ${texturePath}`);
      }

      if (!texture) {
        throw new Error(`Failed to load texture: ${texturePath}`);
      }

      // Apply optimizations
      this.optimizeTexture(texture);

      // Cache the texture
      if (this.config.enableTextureCaching) {
        this.textureCache.set(texturePath, texture);
      }

      // Update stats
      const loadTime = performance.now() - startTime;
      this.stats.averageLoadTime = 
        (this.stats.averageLoadTime * (this.stats.ktx2TexturesLoaded + this.stats.webpFallbacks - 1) + loadTime) / 
        (this.stats.ktx2TexturesLoaded + this.stats.webpFallbacks);

      return texture;

    } catch (error) {
      console.error(`❌ [KTX2Compressor] Failed to load texture: ${texturePath}`, error);
      throw error;
    }
  }

  /**
   * Load KTX2 texture
   */
  private async loadKTX2Texture(path: string): Promise<THREE.Texture | null> {
    if (!this.ktx2Loader) return null;

    return new Promise((resolve) => {
      this.ktx2Loader!.load(
        path,
        (texture: THREE.Texture) => resolve(texture),
        undefined,
        (error: unknown) => {
          console.warn(`⚠️ [KTX2Compressor] KTX2 load failed: ${path}`, error);
          resolve(null);
        }
      );
    });
  }

  /**
   * Load WebP texture as fallback
   */
  private async loadWebPTexture(path: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        path,
        (texture: THREE.Texture) => resolve(texture),
        undefined,
        (error: unknown) => reject(error)
      );
    });
  }

  /**
   * Get KTX2 path for texture
   */
  private getKTX2Path(originalPath: string): string {
    const basePath = originalPath.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    return `${basePath}.ktx2`;
  }

  /**
   * Optimize texture for mobile
   */
  private optimizeTexture(texture: THREE.Texture): void {
    if (this.config.enableMobileOptimization) {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Reduce texture size for mobile
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
      }
    }

    // Apply anisotropic filtering
    if (this.config.enableAnisotropicFiltering) {
      texture.anisotropy = this.config.maxAnisotropy;
    }

    // Generate mipmaps
    if (this.config.enableMipmapGeneration) {
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
    }
  }

  /**
   * Preload texture
   */
  private async preloadTexture(texturePath: string): Promise<void> {
    try {
      await this.loadCompressedTexture(texturePath);
      console.log(`🔄 [KTX2Compressor] Preloaded texture: ${texturePath}`);
    } catch (error) {
      console.warn(`⚠️ [KTX2Compressor] Preload failed: ${texturePath}`, error);
    }
  }

  /**
   * Get compression statistics
   */
  getCompressionStats(): TextureCompressionStats {
    return { ...this.stats };
  }

  /**
   * Get texture cache size
   */
  getCacheSize(): number {
    return this.textureCache.size;
  }

  /**
   * Clear texture cache
   */
  clearCache(): void {
    this.textureCache.forEach(texture => {
      texture.dispose();
    });
    this.textureCache.clear();
    console.log('🧹 [KTX2Compressor] Texture cache cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<KTX2Config>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.clearCache();
  }
}

// Singleton instance
let ktx2TextureCompressor: KTX2TextureCompressor | null = null;

/**
 * Get the KTX2 texture compressor instance
 */
export const getKTX2TextureCompressor = (): KTX2TextureCompressor => {
  if (!ktx2TextureCompressor) {
    ktx2TextureCompressor = new KTX2TextureCompressor();
  }
  return ktx2TextureCompressor;
};

/**
 * Initialize KTX2 texture compressor with custom config
 */
export const initializeKTX2TextureCompressor = (config: Partial<KTX2Config> = {}): KTX2TextureCompressor => {
  ktx2TextureCompressor = new KTX2TextureCompressor(config);
  return ktx2TextureCompressor;
};
