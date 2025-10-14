import React, { useCallback, useMemo } from 'react';
import { useTouchOptimization } from '../hooks/useTouchOptimization';

interface TouchOptimizedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  touchTargetSize?: number;
  enableHapticFeedback?: boolean;
  enableSwipeGestures?: boolean;
}

export const TouchOptimizedButton: React.FC<TouchOptimizedButtonProps> = ({
  children,
  onClick,
  onSwipe,
  disabled = false,
  className = '',
  style = {},
  touchTargetSize,
  enableSwipeGestures = true
}) => {
  const { touchState, isTouchDevice, touchTargetSize: defaultTouchTargetSize } = useTouchOptimization();
  
  // Calculate touch target size
  const targetSize = touchTargetSize || defaultTouchTargetSize;
  
  // Handle touch events
  const handleTouchEvents = useCallback(() => {
    // Handle tap
    if (touchState.gestureType === 'tap' && onClick && !disabled) {
      onClick();
    }
    
    // Handle swipe
    if (touchState.gestureType === 'swipe' && onSwipe && enableSwipeGestures && !disabled) {
      onSwipe(touchState.gestureDirection as 'up' | 'down' | 'left' | 'right');
    }
  }, [touchState, onClick, onSwipe, disabled, enableSwipeGestures]);
  
  // Update touch events when touch state changes
  React.useEffect(() => {
    handleTouchEvents();
  }, [handleTouchEvents]);
  
  // Memoize button styles
  const buttonStyles = useMemo(() => {
    const baseStyles: React.CSSProperties = {
      minWidth: `${targetSize}px`,
      minHeight: `${targetSize}px`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'all 0.2s ease',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      ...style
    };
    
    // Add touch feedback styles
    if (isTouchDevice && !disabled) {
      baseStyles.transform = touchState.isTouching ? 'scale(0.95)' : 'scale(1)';
      baseStyles.backgroundColor = touchState.isTouching ? 'rgba(0,0,0,0.1)' : 'transparent';
    }
    
    return baseStyles;
  }, [targetSize, disabled, style, isTouchDevice, touchState.isTouching]);
  
  // Memoize button classes
  const buttonClasses = useMemo(() => {
    const classes = ['touch-optimized-button'];
    
    if (disabled) classes.push('disabled');
    if (isTouchDevice) classes.push('touch-device');
    if (touchState.isTouching) classes.push('touching');
    if (touchState.gestureType === 'tap') classes.push('tap-detected');
    if (touchState.gestureType === 'swipe') classes.push('swipe-detected');
    
    return [...classes, className].filter(Boolean).join(' ');
  }, [disabled, isTouchDevice, touchState, className]);
  
  return (
    <button
      className={buttonClasses}
      style={buttonStyles}
      disabled={disabled}
      onTouchStart={(e) => {
        // Prevent default to avoid double-tap zoom
        if (isTouchDevice) {
          e.preventDefault();
        }
      }}
      onTouchEnd={(e) => {
        // Prevent default to avoid context menu
        if (isTouchDevice) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
};

export default TouchOptimizedButton;
