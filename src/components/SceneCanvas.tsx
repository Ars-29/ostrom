import { Canvas } from '@react-three/fiber'
import { FC, Suspense, useEffect, useState } from 'react'
import { DepthOfField, EffectComposer, Noise, Sepia, Vignette } from '@react-three/postprocessing' // Import postprocessing components
import { CameraRig } from './CameraRig'
import { Lights } from './Lights'
import SceneDemo from './SceneDemo/SceneDemo'
import SceneStreet from './SceneStreet/SceneStreet'
import SceneRoad from './SceneRoad/SceneRoad'
import ScenePlane from './ScenePlane/ScenePlane'
import { CameraControls, OrbitControls } from '@react-three/drei'
import { degToRad } from 'three/src/math/MathUtils.js'
import MainSky from './MainSky'
import FPSCamera from './FPSCamera' // Import FPSCamera component
import { LabelInfoProvider } from '../contexts/LabelInfoContext';
import { useScene } from '../contexts/SceneContext';
import CameraEditor from './CameraEditor';

interface SceneCanvasProps {
  debugMode?: boolean;
}

export const SceneCanvas: FC<SceneCanvasProps> = ({debugMode}) => {
  const [isMobile, setIsMobile] = useState(false);
  const { currentScene } = useScene();
  const [editorDragging, setEditorDragging] = useState(false);
  const [exportFn, setExportFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Mobile-optimized renderer settings
  const getRendererSettings = () => {
    if (isMobile) {
      return {
        shadows: false, // Disable shadows on mobile
        dpr: [0.75, 1.5] as [number, number], // Lower DPR for mobile
        camera: { fov: 75, near: 0.1, far: 1000, position: [0, 2, 10] as [number, number, number] }, // Reduced far plane
        gl: { 
          antialias: false, // Disable antialiasing on mobile
          powerPreference: 'high-performance' as const,
          stencil: false,
          depth: true,
          alpha: false,
        }
      };
    }
    return {
      shadows: true,
      dpr: [1, 2] as [number, number],
      camera: { fov: 45, near: 0.01, far: 5000, position: [0, 2, 10] as [number, number, number] },
      gl: { antialias: true }
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
        {/* Render all scenes, only active animates sprites */}
        <SceneStreet position={[0, 0, 0]} rotation={[0, 0, 0]} scale={[1, 1, 1]} />
        <SceneRoad position={[75, 0, 0]} rotation={[0, 0, 0]} scale={[1, 1, 1]} />
        <ScenePlane position={[150, 0, 0]} rotation={[0, 0, 0]} scale={[1, 1, 1]} />
        {(!isMobile && !debugMode) && (
            <EffectComposer>
              <Noise opacity={0.1} />
              <Sepia intensity={0.35} />
              <Vignette eskil={false} offset={0} darkness={0.8} opacity={0.5} />
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
    </Canvas>
  )
}
