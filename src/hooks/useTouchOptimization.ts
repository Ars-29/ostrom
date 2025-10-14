import { useState, useEffect } from 'react';
import { getTouchOptimizer, TouchState } from '../utils/TouchOptimizer';

/**
 * Hook for using touch optimization in React components
 */
export const useTouchOptimization = () => {
  const [touchOptimizer] = useState(() => getTouchOptimizer());
  const [touchState, setTouchState] = useState<TouchState>(touchOptimizer.getTouchState());
  
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      const newState = touchOptimizer.handleTouchStart(event);
      setTouchState(newState);
    };
    
    const handleTouchMove = (event: TouchEvent) => {
      const newState = touchOptimizer.handleTouchMove(event);
      setTouchState(newState);
    };
    
    const handleTouchEnd = () => {
      const newState = touchOptimizer.handleTouchEnd();
      setTouchState(newState);
    };
    
    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchOptimizer]);
  
  return {
    touchState,
    config: touchOptimizer.getConfig(),
    isTouchDevice: touchOptimizer.isTouchDevice(),
    touchTargetSize: touchOptimizer.getTouchTargetSize(),
    updateConfig: touchOptimizer.updateConfig.bind(touchOptimizer)
  };
};
