import React, { useState, useEffect, Suspense, lazy, memo } from 'react';
import { useScene } from '../contexts/SceneContext';
import { enhancedScenePreloader } from '../utils/EnhancedSceneAssetPreloader';
import { assetAnalyzer } from '../utils/AssetAnalyzer';

// Lazy load scene components for better performance
const SceneStreet = lazy(() => import('./SceneStreet/SceneStreet'));
const SceneRoad = lazy(() => import('./SceneRoad/SceneRoad'));
const ScenePlane = lazy(() => import('./ScenePlane/ScenePlane'));

// Scene loading fallback component
const SceneLoader: React.FC = () => {
  return (
    <group>
      {/* Simple loading indicator - can be enhanced later */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
    </group>
  );
};

// Enhanced preloader is now imported from utils

interface SceneManagerProps {
  debugMode?: boolean;
}

const SceneManager: React.FC<SceneManagerProps> = memo(({ debugMode = false }) => {
  const { currentScene } = useScene();
  const [isPreloading, setIsPreloading] = useState(false);
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'partial' | 'error'>('loading');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [lastTransitionTime, setLastTransitionTime] = useState(0);

  // Initialize asset analyzer
  useEffect(() => {
    if (debugMode) {
      assetAnalyzer.startRealTimeMonitoring();
    }
  }, [debugMode]);

  // Non-blocking preloading with comprehensive logging and debounce
  useEffect(() => {
    const preloadNextScene = async () => {
      if (isPreloading) return;
      
      const transitionStartTime = performance.now();
      
      // Debounce rapid transitions (minimum 100ms between transitions)
      if (transitionStartTime - lastTransitionTime < 100) {
        console.log(`⏸️ [SceneManager] Debouncing rapid transition to: ${currentScene}`);
        return;
      }
      
      setLastTransitionTime(transitionStartTime);
      console.log(`🚀 [SceneManager] Starting transition to: ${currentScene}`);
      console.log(`⏱️ [SceneManager] Transition start time: ${transitionStartTime.toFixed(2)}ms`);
      
      setIsPreloading(true);
      
      try {
        // Start preloading but don't block the transition
        if (currentScene) {
          // Special handling for plane scene - ensure critical assets are loaded
          if (currentScene === 'section-3' || currentScene === 'footer') {
            console.log(`🚁 [SceneManager] Preloading plane scene critical assets for ${currentScene}...`);
            enhancedScenePreloader.preloadSceneAssets('section-3', 'critical').then(() => {
              console.log(`✅ [SceneManager] Plane scene critical assets preloaded for ${currentScene}`);
            });
          }
          
          // Also preload plane scene when approaching it (section-2)
          if (currentScene === 'section-2') {
            console.log('🚁 [SceneManager] Preloading plane scene assets early (approaching section-3)...');
            enhancedScenePreloader.preloadSceneAssets('section-3', 'critical').then(() => {
              console.log('✅ [SceneManager] Plane scene critical assets preloaded early');
            });
          }
          
          enhancedScenePreloader.preloadAdjacentScenes(currentScene).then(() => {
          const preloadEndTime = performance.now();
          const preloadDuration = preloadEndTime - transitionStartTime;
          
          // Update preloaded scenes set after preloading completes
          // Note: preloadedScenes tracking removed for simplicity
          
          // Update loading state based on preload status
          if (currentScene) {
            const state = enhancedScenePreloader.getLoadingState(currentScene);
            setLoadingState(state);
          }
          
          // Log comprehensive preload stats
          const stats = enhancedScenePreloader.getPreloadStats();
          console.log(`📊 [SceneManager] Preload stats: ${stats.loaded}/${stats.total} (${stats.percentage.toFixed(1)}%)`);
          console.log(`⏱️ [SceneManager] Preload duration: ${preloadDuration.toFixed(2)}ms`);
          console.log(`✅ [SceneManager] Transition to ${currentScene || 'unknown'} completed`);
          
          // Run asset analysis after first scene load
          if (!analysisComplete && stats.loaded > 10) {
            setAnalysisComplete(true);
            assetAnalyzer.analyzeAssetPerformance().then(analysis => {
              assetAnalyzer.logPerformanceReport(analysis);
            });
          }
        });
        }
      } catch (error) {
        console.error('❌ [SceneManager] Error preloading scenes:', error);
        setLoadingState('error');
      } finally {
        setIsPreloading(false);
      }
    };

    preloadNextScene();
  }, [currentScene, isPreloading, analysisComplete, lastTransitionTime]);

  // Render all scenes but control their visibility - this prevents mounting/unmounting
  const renderAllScenes = () => (
    <>
      <SceneStreet 
        position={[0, 0, 0]} 
        rotation={[0, 0, 0]} 
        scale={[1, 1, 1]} 
        visible={currentScene === 'section-1'}
      />
      <SceneRoad 
        position={[75, 0, 0]} 
        rotation={[0, 0, 0]} 
        scale={[1, 1, 1]} 
        visible={currentScene === 'section-2'}
      />
      <ScenePlane 
        position={[150, 0, 0]} 
        rotation={[0, 0, 0]} 
        scale={[1, 1, 1]} 
        visible={currentScene === 'section-3' || currentScene === 'footer'}
      />
    </>
  );

  return (
    <>
      {/* Loading indicator for debug mode */}
      {debugMode && (
        <div style={{
          position: 'fixed',
          top: 10,
          right: 10,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000,
          fontFamily: 'monospace'
        }}>
          <div>Scene: {currentScene}</div>
          <div>State: {loadingState}</div>
          <div>Preloading: {isPreloading ? 'Yes' : 'No'}</div>
        </div>
      )}
      
      <Suspense fallback={<SceneLoader />}>
        {renderAllScenes()}
      </Suspense>
    </>
  );
});

export default SceneManager;
