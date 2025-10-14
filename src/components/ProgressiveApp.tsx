import React, { useState, useEffect } from 'react';
import App from '../App';
import AssetPreloader from '../utils/AssetPreloader';
import { performanceMonitor } from '../utils/PerformanceMonitor';

interface ProgressiveAppProps {
  children?: React.ReactNode;
}

// Global flags to prevent duplicate loading and refreshes
let globalLoadingStarted = false;

// Reset flags on page load (for testing)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalLoadingStarted = false;
  });
}

export const ProgressiveApp: React.FC<ProgressiveAppProps> = () => {
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Prevent duplicate loading in React StrictMode
    if (hasLoaded || globalLoadingStarted) {
      console.log('⚠️ [ProgressiveApp] Skipping duplicate load (React StrictMode)');
      return;
    }
    
    globalLoadingStarted = true;

    // Check if critical assets are already cached
    const checkCacheFirst = async () => {
      const criticalAssets = [
        '/images/logo.svg',
        '/images/background.webp', 
        '/images/divider.png',
        '/fonts/bellefair/Bellefair-Regular.woff2',
        '/fonts/playground/PPPlayground-Variable.woff2'
      ];

      try {
        const cachePromises = criticalAssets.map(async (asset) => {
          const response = await caches.match(asset);
          return !!response;
        });

        const cacheResults = await Promise.all(cachePromises);
        const cachedCount = cacheResults.filter(Boolean).length;
        
        console.log(`📦 [ProgressiveApp] Cache check: ${cachedCount}/${criticalAssets.length} assets cached`);
        
        // If most assets are cached, skip loading state
        if (cachedCount >= criticalAssets.length * 0.8) {
          console.log('✅ [ProgressiveApp] Most assets cached, skipping loading state');
          setHasLoaded(true);
          
          // Mark root as loaded immediately
          const rootElement = document.getElementById('root');
          if (rootElement) {
            rootElement.classList.add('loaded');
          }
          
          performanceMonitor.markAppReady();
          return true; // Assets already cached
        }
        
        return false; // Need to load assets
      } catch (error) {
        console.log('⚠️ [ProgressiveApp] Cache check failed, proceeding with loading');
        return false;
      }
    };

    const loadCriticalAssets = async () => {
      const startTime = performance.now();
      console.log('🚀 [ProgressiveApp] Starting critical asset loading...');
      
      // Show loading state only if we need to load assets
      
      try {
        // Wait for fonts to be ready
        console.log('📝 [ProgressiveApp] Waiting for fonts to be ready...');
        await document.fonts.ready;
        const fontsReadyTime = performance.now();
        console.log(`✅ [ProgressiveApp] Fonts ready in ${(fontsReadyTime - startTime).toFixed(2)}ms`);
        
        performanceMonitor.markFontsReady();

        // Use AssetPreloader for better asset management
        const preloader = new AssetPreloader({
          onProgress: (progress) => {
            console.log(`📈 [ProgressiveApp] Asset loading progress: ${Math.round(progress)}%`);
          },
          onComplete: () => {
            const completeTime = performance.now();
            const totalTime = completeTime - startTime;
            console.log(`🎉 [ProgressiveApp] All critical assets loaded in ${totalTime.toFixed(2)}ms`);
            
            performanceMonitor.markCriticalAssetsLoaded();
            
          setHasLoaded(true); // Mark as loaded to prevent duplicates
          
          // Add loaded class to root for smooth transition
            const rootElement = document.getElementById('root');
            if (rootElement) {
              rootElement.classList.add('loaded');
              console.log('✨ [ProgressiveApp] Root element marked as loaded');
            }

            // Mark app as ready
            setTimeout(() => {
              console.log('✅ [ProgressiveApp] App ready!');
              performanceMonitor.markAppReady();
            }, 100);
          },
          onError: (error) => {
            console.error('❌ [ProgressiveApp] Error loading critical assets:', error);
            setHasLoaded(true); // Mark as loaded even on error to prevent retries
          }
        });

        // Add critical assets
        const criticalAssets = [
          { src: '/images/logo.svg', type: 'image' as const, priority: 'critical' as const },
          { src: '/images/background.webp', type: 'image' as const, priority: 'critical' as const },
          { src: '/images/divider.png', type: 'image' as const, priority: 'critical' as const },
          { src: '/fonts/bellefair/Bellefair-Regular.woff2', type: 'font' as const, priority: 'critical' as const },
          { src: '/fonts/playground/PPPlayground-Variable.woff2', type: 'font' as const, priority: 'critical' as const },
        ];
        
        console.log(`📦 [ProgressiveApp] Adding ${criticalAssets.length} critical assets to preloader`);
        preloader.addAssets(criticalAssets);

        console.log('🔄 [ProgressiveApp] Starting asset preloading...');
        await preloader.preload();

      } catch (error) {
        console.error('❌ [ProgressiveApp] Error loading critical assets:', error);
        setHasLoaded(true); // Mark as loaded even on error to prevent retries
      }
    };

    // Check cache first, then load if needed
    // Small delay to ensure Service Worker is ready
    setTimeout(() => {
      checkCacheFirst().then((assetsCached) => {
        if (!assetsCached) {
          loadCriticalAssets();
        }
      });
    }, 50);
  }, [hasLoaded]);

  useEffect(() => {
    // Mark as hydrated after React is ready
    console.log('⚛️ [ProgressiveApp] React hydration complete');
  }, []);

  // Show app immediately - no loading skeleton
  return <App />;
};

export default ProgressiveApp;
