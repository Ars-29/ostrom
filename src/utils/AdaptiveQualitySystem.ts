/**
 * Adaptive Quality System
 * Dynamically adjusts rendering quality based on device capabilities and performance
 */

export interface DeviceCapabilities {
  // Device Type
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Hardware Capabilities
  devicePixelRatio: number;
  memoryGB: number;
  cores: number;
  
  // Connection
  connectionType: string;
  effectiveType: string;
  downlink: number;
  
  // WebGL Support
  webglVersion: number;
  maxTextureSize: number;
  maxVertexUniforms: number;
  
  // Performance History
  averageFPS: number;
  frameDrops: number;
  loadTime: number;
}

export interface QualitySettings {
  // Rendering Quality
  shadows: boolean;
  antialias: boolean;
  dpr: [number, number];
  
  // Scene Settings
  farPlane: number;
  fov: number;
  
  // Post-Processing
  postProcessing: boolean;
  effectQuality: 'low' | 'medium' | 'high';
  
  // Asset Quality
  textureQuality: 'low' | 'medium' | 'high';
  particleCount: number;
  
  // Performance
  targetFPS: number;
  adaptiveQuality: boolean;
}

export class AdaptiveQualitySystem {
  private capabilities: DeviceCapabilities;
  private qualitySettings: QualitySettings;
  private performanceHistory: number[] = [];
  private frameDropCount = 0;
  private qualityLevel: 'low' | 'medium' | 'high' = 'medium';
  
  constructor() {
    this.capabilities = this.detectDeviceCapabilities();
    this.qualitySettings = this.calculateOptimalSettings();
    this.startPerformanceMonitoring();
    
    console.log('🎯 [AdaptiveQuality] System initialized');
    console.log('📱 [AdaptiveQuality] Device:', this.capabilities.isMobile ? 'Mobile' : this.capabilities.isTablet ? 'Tablet' : 'Desktop');
    console.log('⚡ [AdaptiveQuality] Quality Level:', this.qualityLevel);
    console.log('🔧 [AdaptiveQuality] Settings:', this.qualitySettings);
  }
  
  /**
   * Detect comprehensive device capabilities
   */
  private detectDeviceCapabilities(): DeviceCapabilities {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    // Enhanced mobile detection using user agent
    const userAgent = navigator.userAgent;
    const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isMobile = window.innerWidth <= 768 || isMobileUA;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024 && !isMobileUA;
    const isDesktop = window.innerWidth > 1024 && !isMobileUA;
    
    // Hardware info (with fallbacks)
    const memoryGB = (navigator as any).deviceMemory || 4; // Default to 4GB
    const cores = navigator.hardwareConcurrency || 4; // Default to 4 cores
    
    // Connection info
    const connection = (navigator as any).connection;
    const connectionType = connection?.type || 'unknown';
    const effectiveType = connection?.effectiveType || '4g';
    const downlink = connection?.downlink || 10;
    
    // WebGL capabilities
    let webglVersion = 1;
    let maxTextureSize = 1024;
    let maxVertexUniforms = 256;
    
    if (gl) {
      webglVersion = gl.getParameter(gl.VERSION).includes('WebGL 2') ? 2 : 1;
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    }
    
    return {
      isMobile,
      isTablet,
      isDesktop,
      devicePixelRatio: window.devicePixelRatio,
      memoryGB,
      cores,
      connectionType,
      effectiveType,
      downlink,
      webglVersion,
      maxTextureSize,
      maxVertexUniforms,
      averageFPS: 60, // Will be updated by monitoring
      frameDrops: 0,
      loadTime: performance.now()
    };
  }
  
  /**
   * Calculate optimal quality settings based on device capabilities
   */
  private calculateOptimalSettings(): QualitySettings {
    const { isMobile, isTablet, memoryGB, cores, effectiveType } = this.capabilities;
    
    // Enhanced mobile detection - force low quality on mobile devices
    if (isMobile) {
      this.qualityLevel = 'low';
    } else if (isTablet || memoryGB < 4 || cores < 4 || effectiveType === 'slow-2g' || effectiveType === '2g') {
      this.qualityLevel = 'low';
    } else if (memoryGB < 8 || cores < 6 || effectiveType === '3g') {
      this.qualityLevel = 'medium';
    } else {
      this.qualityLevel = 'high';
    }
    
    // Quality settings based on level - Mobile-optimized defaults
    const settings: QualitySettings = {
      shadows: false,
      antialias: false,
      dpr: isMobile ? [0.5, 1.5] as [number, number] : [0.5, 1] as [number, number], // Cap DPR on mobile
      farPlane: isMobile ? 100 : 1000, // Much shorter far plane on mobile
      fov: isMobile ? 60 : 75, // Smaller FOV on mobile
      postProcessing: false,
      effectQuality: 'low' as const,
      textureQuality: 'low' as const,
      particleCount: isMobile ? 10 : 15, // Fewer particles on mobile
      targetFPS: isMobile ? 30 : 30,
      adaptiveQuality: true
    };
    
    switch (this.qualityLevel) {
      case 'high':
        settings.shadows = true;
        settings.antialias = true;
        settings.dpr = [1, 2] as [number, number];
        settings.farPlane = 5000;
        settings.fov = 45;
        settings.postProcessing = true;
        settings.effectQuality = 'high';
        settings.textureQuality = 'high';
        settings.particleCount = 30;
        settings.targetFPS = 60;
        break;
        
      case 'medium':
        settings.shadows = false;
        settings.antialias = false;
        settings.dpr = [0.75, 1.5] as [number, number];
        settings.farPlane = 2000;
        settings.fov = 60;
        settings.postProcessing = true;
        settings.effectQuality = 'medium';
        settings.textureQuality = 'medium';
        settings.particleCount = 20;
        settings.targetFPS = 45;
        break;
        
      case 'low':
        // Already set above
        break;
    }
    
    return settings;
  }
  
  /**
   * Start monitoring performance and adjust quality dynamically
   */
  private startPerformanceMonitoring(): void {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const monitorFrame = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      // Track frame drops (frames taking longer than 16.67ms for 60fps)
      if (deltaTime > 16.67) {
        this.frameDropCount++;
      }
      
      // Calculate FPS
      const fps = 1000 / deltaTime;
      this.performanceHistory.push(fps);
      
      // Keep only last 60 frames (1 second at 60fps)
      if (this.performanceHistory.length > 60) {
        this.performanceHistory.shift();
      }
      
      // Update average FPS
      const averageFPS = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
      this.capabilities.averageFPS = averageFPS;
      
      // Adaptive quality adjustment
      this.adjustQualityBasedOnPerformance(averageFPS);
      
      frameCount++;
      lastTime = currentTime;
      
      // Log performance every 5 seconds
      if (frameCount % 300 === 0) {
        console.log(`📊 [AdaptiveQuality] Performance: ${averageFPS.toFixed(1)}fps, Drops: ${this.frameDropCount}`);
      }
      
      requestAnimationFrame(monitorFrame);
    };
    
    requestAnimationFrame(monitorFrame);
  }
  
  /**
   * Adjust quality based on current performance
   */
  private adjustQualityBasedOnPerformance(currentFPS: number): void {
    if (!this.qualitySettings.adaptiveQuality) return;
    
    const targetFPS = this.qualitySettings.targetFPS;
    const fpsThreshold = targetFPS * 0.8; // 80% of target FPS
    
    // If performance is poor, reduce quality
    if (currentFPS < fpsThreshold && this.qualityLevel !== 'low') {
      this.reduceQuality();
    }
    // If performance is good and we're not at max quality, increase quality
    else if (currentFPS > targetFPS * 1.1 && this.qualityLevel !== 'high') {
      this.increaseQuality();
    }
  }
  
  /**
   * Reduce quality level
   */
  private reduceQuality(): void {
    const previousLevel = this.qualityLevel;
    
    switch (this.qualityLevel) {
      case 'high':
        this.qualityLevel = 'medium';
        this.qualitySettings.shadows = false;
        this.qualitySettings.antialias = false;
        this.qualitySettings.dpr = [0.75, 1.5] as [number, number];
        this.qualitySettings.particleCount = 20;
        this.qualitySettings.targetFPS = 45;
        break;
        
      case 'medium':
        this.qualityLevel = 'low';
        this.qualitySettings.postProcessing = false;
        this.qualitySettings.dpr = [0.5, 1] as [number, number];
        this.qualitySettings.particleCount = 15;
        this.qualitySettings.targetFPS = 30;
        break;
    }
    
    if (previousLevel !== this.qualityLevel) {
      console.log(`⬇️ [AdaptiveQuality] Quality reduced: ${previousLevel} → ${this.qualityLevel}`);
    }
  }
  
  /**
   * Increase quality level
   */
  private increaseQuality(): void {
    const previousLevel = this.qualityLevel;
    
    switch (this.qualityLevel) {
      case 'low':
        this.qualityLevel = 'medium';
        this.qualitySettings.postProcessing = true;
        this.qualitySettings.dpr = [0.75, 1.5] as [number, number];
        this.qualitySettings.particleCount = 20;
        this.qualitySettings.targetFPS = 45;
        break;
        
      case 'medium':
        this.qualityLevel = 'high';
        this.qualitySettings.shadows = true;
        this.qualitySettings.antialias = true;
        this.qualitySettings.dpr = [1, 2] as [number, number];
        this.qualitySettings.particleCount = 30;
        this.qualitySettings.targetFPS = 60;
        break;
    }
    
    if (previousLevel !== this.qualityLevel) {
      console.log(`⬆️ [AdaptiveQuality] Quality increased: ${previousLevel} → ${this.qualityLevel}`);
    }
  }
  
  /**
   * Get current quality settings
   */
  public getQualitySettings(): QualitySettings {
    return { ...this.qualitySettings };
  }
  
  /**
   * Get current quality level
   */
  public getQualityLevel(): 'low' | 'medium' | 'high' {
    return this.qualityLevel;
  }
  
  /**
   * Get device capabilities
   */
  public getCapabilities(): DeviceCapabilities {
    return { ...this.capabilities };
  }
  
  /**
   * Force a specific quality level
   */
  public setQualityLevel(level: 'low' | 'medium' | 'high'): void {
    this.qualityLevel = level;
    this.qualitySettings = this.calculateOptimalSettings();
    console.log(`🎯 [AdaptiveQuality] Quality forced to: ${level}`);
  }
  
  /**
   * Get performance statistics
   */
  public getPerformanceStats(): {
    averageFPS: number;
    frameDrops: number;
    qualityLevel: string;
    deviceType: string;
  } {
    return {
      averageFPS: this.capabilities.averageFPS,
      frameDrops: this.frameDropCount,
      qualityLevel: this.qualityLevel,
      deviceType: this.capabilities.isMobile ? 'Mobile' : this.capabilities.isTablet ? 'Tablet' : 'Desktop'
    };
  }
}

// Singleton instance
let adaptiveQualitySystem: AdaptiveQualitySystem | null = null;

/**
 * Get the adaptive quality system instance
 */
export const getAdaptiveQualitySystem = (): AdaptiveQualitySystem => {
  if (!adaptiveQualitySystem) {
    adaptiveQualitySystem = new AdaptiveQualitySystem();
  }
  return adaptiveQualitySystem;
};
