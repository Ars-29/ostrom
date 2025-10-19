import { Canvas } from '@react-three/fiber'
import { FC, Suspense, useState, useEffect } from 'react'
import { EffectComposer, Noise, Sepia, Vignette } from '@react-three/postprocessing'
import { CameraRig } from './CameraRig'
import { Lights } from './Lights'
import SceneManager from './SceneManager'
import MainSky from './MainSky'
import FPSCamera from './FPSCamera'
import { useScene } from '../contexts/SceneContext';
import CameraEditor from './CameraEditor';
import { useAdaptiveQuality } from '../hooks/useAdaptiveQuality';
import { initializeEnhancedPerformanceMonitoring } from '../utils/EnhancedPerformanceMonitor';
import InstancedSpriteManager from './InstancedSpriteManager';
import { initializeWebGLContextOptimizer } from '../utils/WebGLContextOptimizer';
// import { initializeAdvancedScrollOptimizer } from '../utils/AdvancedScrollOptimizer'; // Disabled for faster startup

interface SceneCanvasProps {
  debugMode?: boolean;
}

export const SceneCanvas: FC<SceneCanvasProps> = ({debugMode}) => {
  const { currentScene } = useScene();
  const [editorDragging, setEditorDragging] = useState(false);
  const [exportFn, setExportFn] = useState<(() => void) | null>(null);
  
  // Use adaptive quality system
  const { qualitySettings, qualityLevel, performanceStats } = useAdaptiveQuality();

  // Fast initialization - minimal overhead for better startup performance
  useEffect(() => {
    // Only initialize essential optimizations for faster startup
    const performanceMonitor = initializeEnhancedPerformanceMonitoring();
    
    // Minimal WebGL context optimizer
    const webglOptimizer = initializeWebGLContextOptimizer({
      enableContextLossHandling: true,
      enableContextRestoreHandling: true,
      enableMobileOptimizations: false,
      enableMemoryManagement: false, // Disable for faster startup
      enableTextureCompression: false
    });

    // Disable scroll optimizer for faster initial load
    // const scrollOptimizer = initializeAdvancedScrollOptimizer({...});

    // Set up context loss handlers - Disable automatic reload
    webglOptimizer.onContextLoss(() => {
      console.warn('WebGL context lost - attempting recovery without reload');
    });

    webglOptimizer.onContextRestore(() => {
      console.log('WebGL context restored successfully');
    });
    
    // Log initialization
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const emoji = isMobile ? '📱' : '🖥️';
    console.log(`${emoji} [SceneCanvas] Performance monitoring initialized with reduced optimizations`);
    
    return () => {
      performanceMonitor.stopMonitoring();
      webglOptimizer.cleanup();
      // scrollOptimizer.cleanup(); // Disabled for faster startup
    };
  }, []);

  // Enhanced mobile-optimized renderer settings - Less aggressive
  const getRendererSettings = () => {
    return {
      shadows: qualitySettings.shadows, // Use adaptive quality settings
      dpr: qualitySettings.dpr[1], // Use adaptive quality settings
      camera: { 
        fov: qualitySettings.fov, // Use adaptive quality settings
        near: 0.1, 
        far: qualitySettings.farPlane, // Use adaptive quality settings
        position: [0, 2, 10] as [number, number, number] 
      },
      gl: { 
        antialias: qualitySettings.antialias, // Use adaptive quality settings
        powerPreference: 'high-performance' as const,
        stencil: false,
        depth: true,
        alpha: false,
        preserveDrawingBuffer: false, // Keep memory optimization
        failIfMajorPerformanceCaveat: false, // Don't fail on weak devices
        precision: 'highp', // Use high precision by default
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
      <MainSky scene={currentScene} />
      <Suspense fallback={null}>
        {debugMode ? <FPSCamera disabled={editorDragging} /> : <CameraRig />}
        {/* CameraEditor only in debug mode */}
        {debugMode && false && <CameraEditor onDraggingChange={setEditorDragging} onExportReady={setExportFn} />}
        
        {/* Instanced Sprite Manager for optimization */}
        <InstancedSpriteManager 
          enableInstancedRendering={true}
          enableFrustumCulling={true}
          enableVirtualScrolling={true}
          enablePerformanceMonitoring={true}
          updateInterval={(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? 33 : 16} // 30fps on mobile, 60fps on desktop
        />
        
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
