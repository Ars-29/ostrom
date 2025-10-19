import React, { useState, useEffect } from 'react';
import App from '../App';
// import AssetPreloader from '../utils/AssetPreloader'; // Removed for faster loading
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

    // Fast loading - skip complex cache checking for better performance
    const checkCacheFirst = async () => {
      // Skip complex cache checking to improve initial load speed
      console.log('🚀 [ProgressiveApp] Fast loading mode - skipping cache check');
      return false; // Always proceed with loading for consistent experience
    };

    const loadCriticalAssets = async () => {
      const startTime = performance.now();
      console.log('🚀 [ProgressiveApp] Starting critical asset loading...');
      
      // Show loading state only if we need to load assets
      
      try {
        // Fast loading - minimal delay
        console.log('⚡ [ProgressiveApp] Fast loading mode - minimal assets');
        
        // Just wait for fonts briefly, don't block on assets
        const fontPromise = document.fonts.ready;
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 500)); // Max 500ms wait
        
        await Promise.race([fontPromise, timeoutPromise]);
        
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        console.log(`⚡ [ProgressiveApp] Fast loading complete in ${loadTime.toFixed(2)}ms`);
        
        // Mark as loaded immediately
        setHasLoaded(true);
        
        // Add loaded class to root for smooth transition
        const rootElement = document.getElementById('root');
        if (rootElement) {
          rootElement.classList.add('loaded');
          console.log('✨ [ProgressiveApp] Root element marked as loaded');
        }

        // Mark app as ready quickly
        setTimeout(() => {
          console.log('✅ [ProgressiveApp] App ready!');
          performanceMonitor.markAppReady();
        }, 50); // Reduced delay

      } catch (error) {
        console.error('❌ [ProgressiveApp] Error loading critical assets:', error);
        setHasLoaded(true); // Mark as loaded even on error to prevent retries
      }
    };

    // Fast loading - minimal delay
    setTimeout(() => {
      checkCacheFirst().then((assetsCached) => {
        if (!assetsCached) {
          loadCriticalAssets();
        }
      });
    }, 10); // Reduced delay for faster initial load
  }, [hasLoaded]);

  useEffect(() => {
    // Mark as hydrated after React is ready
    console.log('⚛️ [ProgressiveApp] React hydration complete');
  }, []);

  // Show app immediately - no loading skeleton
  return <App />;
};

export default ProgressiveApp;
