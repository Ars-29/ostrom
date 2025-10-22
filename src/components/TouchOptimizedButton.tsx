import React, { useCallback, useMemo, useState, useRef } from 'react';
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
  deadzoneSize?: number; // Additional pixels around button to prevent accidental triggers
}

export const TouchOptimizedButton: React.FC<TouchOptimizedButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  style = {},
  touchTargetSize,
  deadzoneSize = 8
}) => {
  const { isTouchDevice, touchTargetSize: defaultTouchTargetSize } = useTouchOptimization();
  const [localTouchState, setLocalTouchState] = useState({
    isTouching: false,
    touchStartTime: 0,
    touchStartPosition: { x: 0, y: 0 },
    touchCurrentPosition: { x: 0, y: 0 },
    gestureType: 'none' as 'tap' | 'swipe' | 'scroll' | 'none',
    isScrolling: false
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Calculate touch target size
  const targetSize = touchTargetSize || defaultTouchTargetSize;
  
  // Check if touch is within deadzone
  const isWithinDeadzone = useCallback((touchX: number, touchY: number) => {
    if (!buttonRef.current) return false;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const deadzoneRect = {
      left: rect.left - deadzoneSize,
      right: rect.right + deadzoneSize,
      top: rect.top - deadzoneSize,
      bottom: rect.bottom + deadzoneSize
    };
    
    return touchX >= deadzoneRect.left && 
           touchX <= deadzoneRect.right && 
           touchY >= deadzoneRect.top && 
           touchY <= deadzoneRect.bottom;
  }, [deadzoneSize]);
  
  // Local touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isTouchDevice || disabled) return;
    
    const touch = e.touches[0];
    const now = performance.now();
    
    setLocalTouchState({
      isTouching: true,
      touchStartTime: now,
      touchStartPosition: { x: touch.clientX, y: touch.clientY },
      touchCurrentPosition: { x: touch.clientX, y: touch.clientY },
      gestureType: 'none',
      isScrolling: false
    });
  }, [isTouchDevice, disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isTouchDevice || disabled || !localTouchState.isTouching) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - localTouchState.touchStartPosition.x;
    const deltaY = touch.clientY - localTouchState.touchStartPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Detect if this is a scroll gesture
    const isScroll = distance > 15 && (Math.abs(deltaY) > Math.abs(deltaX) || Math.abs(deltaX) > Math.abs(deltaY));
    
    setLocalTouchState(prev => ({
      ...prev,
      touchCurrentPosition: { x: touch.clientX, y: touch.clientY },
      gestureType: isScroll ? 'scroll' : (distance > 10 ? 'swipe' : 'tap'),
      isScrolling: isScroll
    }));
  }, [isTouchDevice, disabled, localTouchState.isTouching, localTouchState.touchStartPosition]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isTouchDevice || disabled || !localTouchState.isTouching) return;
    
    const now = performance.now();
    const duration = now - localTouchState.touchStartTime;
    
    // Check if touch ended within deadzone
    const touch = e.changedTouches[0];
    const withinDeadzone = isWithinDeadzone(touch.clientX, touch.clientY);
    
    // Only trigger click if it's a tap, not a scroll, and within deadzone
    if (localTouchState.gestureType === 'tap' && 
        duration < 300 && 
        !localTouchState.isScrolling && 
        withinDeadzone) {
      if (onClick) {
        onClick();
      }
    }
    
    // Reset local touch state
    setLocalTouchState({
      isTouching: false,
      touchStartTime: 0,
      touchStartPosition: { x: 0, y: 0 },
      touchCurrentPosition: { x: 0, y: 0 },
      gestureType: 'none',
      isScrolling: false
    });
  }, [isTouchDevice, disabled, localTouchState, onClick, isWithinDeadzone]);
  
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
      baseStyles.transform = localTouchState.isTouching ? 'scale(0.95)' : 'scale(1)';
      baseStyles.backgroundColor = localTouchState.isTouching ? 'rgba(0,0,0,0.1)' : 'transparent';
    }
    
    return baseStyles;
  }, [targetSize, disabled, style, isTouchDevice, localTouchState.isTouching]);
  
  // Memoize button classes
  const buttonClasses = useMemo(() => {
    const classes = ['touch-optimized-button'];
    
    if (disabled) classes.push('disabled');
    if (isTouchDevice) classes.push('touch-device');
    if (localTouchState.isTouching) classes.push('touching');
    if (localTouchState.gestureType === 'tap') classes.push('tap-detected');
    if (localTouchState.gestureType === 'swipe') classes.push('swipe-detected');
    if (localTouchState.isScrolling) classes.push('scrolling');
    
    return [...classes, className].filter(Boolean).join(' ');
  }, [disabled, isTouchDevice, localTouchState, className]);
  
  return (
    <>
      <button
        ref={buttonRef}
        className={buttonClasses}
        style={buttonStyles}
        disabled={disabled}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          // Prevent click if we're on a touch device and handled via touch events
          if (isTouchDevice) {
            e.preventDefault();
          }
        }}
      >
        {children}
      </button>
      
      {/* Enhanced styles for touch optimization */}
      <style>{`
        .touch-optimized-button.scrolling {
          pointer-events: none !important;
          opacity: 0.7;
        }
        
        .touch-optimized-button.touching {
          transition: transform 0.1s ease, background-color 0.1s ease;
        }
        
        .touch-optimized-button.tap-detected {
          animation: tap-feedback 0.2s ease;
        }
        
        @keyframes tap-feedback {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        
        /* Prevent text selection during touch - iOS 17+ compatible */
        .touch-optimized-button {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          touch-action: pan-y; /* Allow vertical scrolling on iOS 17+ */
        }
      `}</style>
    </>
  );
};

export default TouchOptimizedButton;
