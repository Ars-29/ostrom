import { useState, useEffect } from 'react';
import { getAdaptiveQualitySystem, QualitySettings } from '../utils/AdaptiveQualitySystem';

/**
 * Hook for using adaptive quality in React components
 */
export const useAdaptiveQuality = () => {
  const [qualitySystem] = useState(() => getAdaptiveQualitySystem());
  const [qualitySettings, setQualitySettings] = useState<QualitySettings>(qualitySystem.getQualitySettings());
  const [qualityLevel, setQualityLevel] = useState<'low' | 'medium' | 'high'>(qualitySystem.getQualityLevel());
  
  useEffect(() => {
    const updateQuality = () => {
      setQualitySettings(qualitySystem.getQualitySettings());
      setQualityLevel(qualitySystem.getQualityLevel());
    };
    
    // Update every 2 seconds
    const interval = setInterval(updateQuality, 2000);
    
    return () => clearInterval(interval);
  }, [qualitySystem]);
  
  return {
    qualitySettings,
    qualityLevel,
    capabilities: qualitySystem.getCapabilities(),
    performanceStats: qualitySystem.getPerformanceStats(),
    setQualityLevel: qualitySystem.setQualityLevel.bind(qualitySystem)
  };
};
