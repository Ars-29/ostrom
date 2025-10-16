/**
 * WebGL Context Optimizer
 * Implements WebGL context persistence and mobile-specific settings
 */

interface WebGLContextConfig {
  enableContextLossHandling: boolean;
  enableContextRestoreHandling: boolean;
  enableMobileOptimizations: boolean;
  enableMemoryManagement: boolean;
  enableTextureCompression: boolean;
  maxTextureSize: number;
  maxCubemapSize: number;
  maxRenderbufferSize: number;
  maxVertexAttribs: number;
  maxVaryingVectors: number;
  maxFragmentUniforms: number;
  maxVertexUniforms: number;
  maxTextureImageUnits: number;
  maxVertexTextureImageUnits: number;
  maxCombinedTextureImageUnits: number;
}

interface WebGLContextStats {
  contextLost: boolean;
  contextRestored: boolean;
  memoryUsage: number;
  textureCount: number;
  bufferCount: number;
  programCount: number;
  lastContextLoss: number;
  lastContextRestore: number;
}

export class WebGLContextOptimizer {
  private config: WebGLContextConfig;
  private stats: WebGLContextStats;
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private contextLossHandlers: Array<() => void> = [];
  private contextRestoreHandlers: Array<() => void> = [];
  private memoryCleanupInterval: number | null = null;

  constructor(config: Partial<WebGLContextConfig> = {}) {
    this.config = {
      enableContextLossHandling: true,
      enableContextRestoreHandling: true,
      enableMobileOptimizations: true,
      enableMemoryManagement: true,
      enableTextureCompression: true,
      maxTextureSize: 2048,
      maxCubemapSize: 1024,
      maxRenderbufferSize: 2048,
      maxVertexAttribs: 16,
      maxVaryingVectors: 8,
      maxFragmentUniforms: 16,
      maxVertexUniforms: 16,
      maxTextureImageUnits: 8,
      maxVertexTextureImageUnits: 4,
      maxCombinedTextureImageUnits: 12,
      ...config
    };

    this.stats = {
      contextLost: false,
      contextRestored: false,
      memoryUsage: 0,
      textureCount: 0,
      bufferCount: 0,
      programCount: 0,
      lastContextLoss: 0,
      lastContextRestore: 0
    };

    this.initializeContextOptimization();
  }

  /**
   * Initialize WebGL context optimization
   */
  private initializeContextOptimization(): void {
    if (typeof window === 'undefined') return;

    // Detect mobile devices for mobile-specific optimizations
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && this.config.enableMobileOptimizations) {
      this.applyMobileOptimizations();
    }

    // Set up context loss handling
    if (this.config.enableContextLossHandling) {
      this.setupContextLossHandling();
    }

    // Set up memory management
    if (this.config.enableMemoryManagement) {
      this.setupMemoryManagement();
    }
  }

  /**
   * Apply mobile-specific WebGL optimizations
   */
  private applyMobileOptimizations(): void {
    // Reduce maximum texture sizes for mobile
    this.config.maxTextureSize = Math.min(this.config.maxTextureSize, 1024);
    this.config.maxCubemapSize = Math.min(this.config.maxCubemapSize, 512);
    this.config.maxRenderbufferSize = Math.min(this.config.maxRenderbufferSize, 1024);

    // Reduce uniform limits for mobile
    this.config.maxFragmentUniforms = Math.min(this.config.maxFragmentUniforms, 8);
    this.config.maxVertexUniforms = Math.min(this.config.maxVertexUniforms, 8);
    this.config.maxTextureImageUnits = Math.min(this.config.maxTextureImageUnits, 4);

    console.log('📱 [WebGLContextOptimizer] Mobile optimizations applied');
  }

  /**
   * Set up context loss handling
   */
  private setupContextLossHandling(): void {
    if (typeof window === 'undefined') return;

    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      this.handleContextLoss();
    });

    canvas.addEventListener('webglcontextrestored', () => {
      this.handleContextRestore();
    });
  }

  /**
   * Handle WebGL context loss
   */
  private handleContextLoss(): void {
    this.stats.contextLost = true;
    this.stats.lastContextLoss = performance.now();
    
    console.warn('⚠️ [WebGLContextOptimizer] WebGL context lost - attempting recovery');
    
    // Notify all registered handlers
    this.contextLossHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('Error in context loss handler:', error);
      }
    });

    // Clear WebGL state
    this.clearWebGLState();
  }

  /**
   * Handle WebGL context restore
   */
  private handleContextRestore(): void {
    this.stats.contextRestored = true;
    this.stats.lastContextRestore = performance.now();
    
    console.log('✅ [WebGLContextOptimizer] WebGL context restored');
    
    // Notify all registered handlers
    this.contextRestoreHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('Error in context restore handler:', error);
      }
    });

    // Reinitialize WebGL state
    this.reinitializeWebGLState();
  }

  /**
   * Clear WebGL state during context loss
   */
  private clearWebGLState(): void {
    if (!this.gl) return;

    // Clear textures
    const maxTextureUnits = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);
    for (let i = 0; i < maxTextureUnits; i++) {
      this.gl.activeTexture(this.gl.TEXTURE0 + i);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
      this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
    }

    // Clear buffers
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);

    // Clear programs
    this.gl.useProgram(null);

    this.stats.textureCount = 0;
    this.stats.bufferCount = 0;
    this.stats.programCount = 0;
  }

  /**
   * Reinitialize WebGL state after context restore
   */
  private reinitializeWebGLState(): void {
    // This would typically involve reloading textures, shaders, etc.
    // For now, we'll just reset the stats
    this.stats.contextLost = false;
    this.stats.contextRestored = false;
  }

  /**
   * Set up memory management
   */
  private setupMemoryManagement(): void {
    // Set up periodic memory cleanup
    this.memoryCleanupInterval = window.setInterval(() => {
      this.performMemoryCleanup();
    }, 30000); // Every 30 seconds

    // Set up memory pressure handling
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        this.stats.memoryUsage = memoryInfo.usedJSHeapSize;
      }
    }
  }

  /**
   * Perform memory cleanup
   */
  private performMemoryCleanup(): void {
    if (!this.gl) return;

    // Force garbage collection if available
    if (typeof (window as any).gc === 'function') {
      (window as any).gc();
    }

    // Clear unused textures
    this.clearUnusedTextures();

    // Update memory stats
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        this.stats.memoryUsage = memoryInfo.usedJSHeapSize;
      }
    }
  }

  /**
   * Clear unused textures
   */
  private clearUnusedTextures(): void {
    if (!this.gl) return;

    // This is a simplified implementation
    // In a real scenario, you'd track texture usage and clear unused ones
    const maxTextureUnits = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);
    for (let i = 0; i < maxTextureUnits; i++) {
      this.gl.activeTexture(this.gl.TEXTURE0 + i);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
  }

  /**
   * Register context loss handler
   */
  onContextLoss(handler: () => void): void {
    this.contextLossHandlers.push(handler);
  }

  /**
   * Register context restore handler
   */
  onContextRestore(handler: () => void): void {
    this.contextRestoreHandlers.push(handler);
  }

  /**
   * Get WebGL context statistics
   */
  getStats(): WebGLContextStats {
    return { ...this.stats };
  }

  /**
   * Get WebGL context configuration
   */
  getConfig(): WebGLContextConfig {
    return { ...this.config };
  }

  /**
   * Update WebGL context configuration
   */
  updateConfig(newConfig: Partial<WebGLContextConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.memoryCleanupInterval) {
      clearInterval(this.memoryCleanupInterval);
      this.memoryCleanupInterval = null;
    }

    this.contextLossHandlers = [];
    this.contextRestoreHandlers = [];
  }
}

// Singleton instance
let webglContextOptimizer: WebGLContextOptimizer | null = null;

/**
 * Get the WebGL context optimizer instance
 */
export const getWebGLContextOptimizer = (): WebGLContextOptimizer => {
  if (!webglContextOptimizer) {
    webglContextOptimizer = new WebGLContextOptimizer();
  }
  return webglContextOptimizer;
};

/**
 * Initialize WebGL context optimizer with custom config
 */
export const initializeWebGLContextOptimizer = (config: Partial<WebGLContextConfig> = {}): WebGLContextOptimizer => {
  webglContextOptimizer = new WebGLContextOptimizer(config);
  return webglContextOptimizer;
};
