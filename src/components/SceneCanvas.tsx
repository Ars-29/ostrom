import { Canvas } from '@react-three/fiber'
import { FC, Suspense, useState, useEffect } from 'react'
import { EffectComposer, Noise, Sepia, Vignette } from '@react-three/postprocessing'
import { CameraRig } from './CameraRig'
import { Lights } from './Lights'
import SceneManager from './SceneManager'
import DeviceAwareSky from './DeviceAwareSky'
import FPSCamera from './FPSCamera'
import { useScene } from '../contexts/SceneContext';
import CameraEditor from './CameraEditor';
import { useAdaptiveQuality } from '../hooks/useAdaptiveQuality';
import { initializeEnhancedPerformanceMonitoring } from '../utils/EnhancedPerformanceMonitor';
import InstancedSpriteManager from './InstancedSpriteManager';
import { initializeWebGLContextOptimizer } from '../utils/WebGLContextOptimizer';
import { initializeAdvancedScrollOptimizer } from '../utils/AdvancedScrollOptimizer';

interface SceneCanvasProps {
  debugMode?: boolean;
}

export const SceneCanvas: FC<SceneCanvasProps> = ({debugMode}) => {
  const { currentScene } = useScene();
  const [editorDragging, setEditorDragging] = useState(false);
  const [exportFn, setExportFn] = useState<(() => void) | null>(null);
  
  // Use adaptive quality system
  const { qualitySettings, qualityLevel, performanceStats } = useAdaptiveQuality();

  // Initialize enhanced performance monitoring, WebGL context optimizer, and scroll optimizer (MOBILE ONLY)
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
      // Desktop - skip optimization systems to prevent lag
      console.log('🖥️ [SceneCanvas] Desktop detected - skipping optimization systems for better performance');
      return;
    }

    // Mobile only - initialize optimization systems
    const performanceMonitor = initializeEnhancedPerformanceMonitoring();
    
    // Initialize WebGL context optimizer
    const webglOptimizer = initializeWebGLContextOptimizer({
      enableContextLossHandling: true,
      enableContextRestoreHandling: true,
      enableMobileOptimizations: true,
      enableMemoryManagement: true,
      enableTextureCompression: true
    });

    // Initialize advanced scroll optimizer
    const scrollOptimizer = initializeAdvancedScrollOptimizer({
      enableScrollThrottling: true,
      throttleInterval: 16,
      enableScrollPrediction: true,
      enableScrollCaching: true,
      enableScrollBatching: true,
      enableScrollDebouncing: true,
      debounceDelay: 100,
      enableScrollVirtualization: true,
      enableScrollLazyLoading: true,
      enableScrollIntersectionObserver: true,
      enableScrollPerformanceMonitoring: true
    });

    // Set up context loss handlers
    webglOptimizer.onContextLoss(() => {
      console.warn('WebGL context lost - reloading page');
      window.location.reload();
    });

    webglOptimizer.onContextRestore(() => {
      console.log('WebGL context restored - reinitializing');
    });
    
    // Log initialization
    console.log('📱 [SceneCanvas] Mobile optimization systems initialized');
    
    return () => {
      performanceMonitor.stopMonitoring();
      webglOptimizer.cleanup();
      scrollOptimizer.cleanup();
    };
  }, []);

  // Enhanced mobile-optimized renderer settings
  const getRendererSettings = () => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return {
      shadows: qualitySettings.shadows && !isMobile, // Disable shadows on mobile
      dpr: isMobile ? Math.min(qualitySettings.dpr[1], 1.5) : qualitySettings.dpr[1], // Cap DPR on mobile
      camera: { 
        fov: isMobile ? 60 : qualitySettings.fov, // Smaller FOV on mobile = less geometry
        near: 0.1, 
        far: isMobile ? 100 : qualitySettings.farPlane, // Shorter far plane on mobile
        position: [0, 2, 10] as [number, number, number] 
      },
      gl: { 
        antialias: qualitySettings.antialias && !isMobile, // Disable antialiasing on mobile
        powerPreference: 'high-performance' as const,
        stencil: false,
        depth: true,
        alpha: false,
        preserveDrawingBuffer: false, // Save memory on mobile
        failIfMajorPerformanceCaveat: isMobile, // Fail gracefully on weak devices
        precision: isMobile ? 'lowp' : 'highp', // Lower precision on mobile
      }
    };
  };

  const settings = getRendererSettings();
  
  // Render all scenes, but only the active one will animate sprites
  return (
    <Canvas
      shadows={settings.shadows}
      dpr={settings.dpr}
      camera={settings.camera}
      gl={settings.gl}
      className='app-canvas'
    >
      <Lights debug={debugMode} />
      <DeviceAwareSky scene={currentScene} />
      <Suspense fallback={null}>
        {debugMode ? <FPSCamera disabled={editorDragging} /> : <CameraRig />}
        {/* CameraEditor only in debug mode */}
        {debugMode && false && <CameraEditor onDraggingChange={setEditorDragging} onExportReady={setExportFn} />}
        
        {/* Instanced Sprite Manager for optimization (MOBILE ONLY) */}
        {(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) && (
          <InstancedSpriteManager 
            enableInstancedRendering={true}
            enableFrustumCulling={true}
            enableVirtualScrolling={true}
            enablePerformanceMonitoring={true}
            updateInterval={33} // 30fps on mobile
          />
        )}
        
        {/* Use SceneManager for dynamic scene loading */}
        <SceneManager debugMode={debugMode} />
        {/* Adaptive post-processing based on quality settings - Disabled on mobile */}
        {qualitySettings.postProcessing && !debugMode && currentScene !== 'intro' && currentScene !== 'footer' && !(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) && (
            <EffectComposer>
              <Noise opacity={qualitySettings.effectQuality === 'high' ? 0.05 : qualitySettings.effectQuality === 'medium' ? 0.03 : 0.01} />
              <Sepia intensity={qualitySettings.effectQuality === 'high' ? 0.2 : qualitySettings.effectQuality === 'medium' ? 0.1 : 0.05} />
              <Vignette eskil={false} offset={0} darkness={qualitySettings.effectQuality === 'high' ? 0.6 : qualitySettings.effectQuality === 'medium' ? 0.4 : 0.2} opacity={qualitySettings.effectQuality === 'high' ? 0.3 : qualitySettings.effectQuality === 'medium' ? 0.2 : 0.1} />
            </EffectComposer>
        )}
      </Suspense>
      {/* Export button as fixed overlay, only in debug mode */}
      {debugMode && exportFn && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1000,
          pointerEvents: 'auto',
        }}>
          <button style={{ fontSize: 16, padding: 8, background: '#222', color: '#fff', borderRadius: 4 }} onClick={exportFn}>
            Export Camera Path JSON
          </button>
        </div>
      )}
      
      {/* Adaptive Quality Debug Overlay */}
      {debugMode && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 1000,
          fontFamily: 'monospace',
          minWidth: '200px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4CAF50' }}>
            🎯 Adaptive Quality System
          </div>
          <div>Level: <span style={{ color: qualityLevel === 'high' ? '#4CAF50' : qualityLevel === 'medium' ? '#FF9800' : '#F44336' }}>{qualityLevel.toUpperCase()}</span></div>
          <div>FPS: <span style={{ color: performanceStats.averageFPS > 50 ? '#4CAF50' : performanceStats.averageFPS > 30 ? '#FF9800' : '#F44336' }}>{performanceStats.averageFPS.toFixed(1)}</span></div>
          <div>Drops: <span style={{ color: performanceStats.frameDrops < 10 ? '#4CAF50' : '#FF9800' }}>{performanceStats.frameDrops}</span></div>
          <div>Device: {performanceStats.deviceType}</div>
          <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.7 }}>
            Shadows: {qualitySettings.shadows ? '✅' : '❌'}<br/>
            Antialias: {qualitySettings.antialias ? '✅' : '❌'}<br/>
            PostFX: {qualitySettings.postProcessing ? '✅' : '❌'}<br/>
            Particles: {qualitySettings.particleCount}
          </div>
        </div>
      )}
    </Canvas>
  )
}
