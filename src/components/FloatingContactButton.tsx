import React, { useState, useEffect } from 'react';
import TouchOptimizedButton from './TouchOptimizedButton';

interface FloatingContactButtonProps {
  onClick?: () => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  showDelay?: number;
  hideOnScroll?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const FloatingContactButton: React.FC<FloatingContactButtonProps> = ({
  onClick,
  position = 'bottom-left',
  showDelay = 3000, // Show after 3 seconds
  hideOnScroll = false,
  className = '',
  style = {}
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Show button after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);
    
    return () => clearTimeout(timer);
  }, [showDelay]);
  
  // Handle scroll behavior for hiding/showing (simplified)
  useEffect(() => {
    if (!hideOnScroll) return;
    
    let lastScrollY = 0;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      
      // Only hide when scrolling down very fast, otherwise keep visible
      if (scrollDirection === 'down' && currentScrollY > 200 && (currentScrollY - lastScrollY) > 50) {
        setIsVisible(false);
      } else if (scrollDirection === 'up' || currentScrollY < 200) {
        setIsVisible(true);
      }
      
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll]);
  
  // Get position styles
  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 40, // Reduced from 1000 to prevent interference
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: isVisible ? 1 : 0,
      transform: isVisible 
        ? (isHovered ? 'scale(1.1)' : 'scale(1)')
        : 'scale(0.8)',
      pointerEvents: isVisible ? 'auto' : 'none',
      touchAction: 'manipulation' // Prevent double-tap zoom
    };
    
    switch (position) {
      case 'bottom-left':
        return {
          ...baseStyles,
          bottom: '20px',
          left: '20px'
        };
      case 'bottom-right':
        return {
          ...baseStyles,
          bottom: '20px',
          right: '20px'
        };
      case 'top-left':
        return {
          ...baseStyles,
          top: '20px',
          left: '20px'
        };
      case 'top-right':
        return {
          ...baseStyles,
          top: '20px',
          right: '20px'
        };
      default:
        return baseStyles;
    }
  };
  
  // Get button styles
  const getButtonStyles = (): React.CSSProperties => ({
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 50%, #0d0d0d 100%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    ...(isHovered && {
      transform: 'translateY(-2px)'
    }),
    ...style
  });
  
  // Get tooltip styles
  const getTooltipStyles = (): React.CSSProperties => {
    const isLeft = position.includes('left');
    
    return {
      position: 'absolute',
      ...(isLeft ? { right: '70px' } : { left: '70px' }),
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#ffffff',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      opacity: isHovered ? 1 : 0,
      visibility: isHovered ? 'visible' : 'hidden',
      transition: 'all 0.3s ease',
      pointerEvents: 'none',
      zIndex: 1001
    };
  };
  
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  // Prevent accidental triggers during scroll
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only handle touches directly on the button, not on the container
    if (e.target !== e.currentTarget) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    // Only handle touches directly on the button
    if (e.target !== e.currentTarget) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // No default action - just log for now
      console.log('Contact button clicked - no default action');
    }
  };
  
  return (
    <div
      className={`floating-contact-container ${className}`}
      style={getPositionStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tooltip */}
      <div
        className="contact-tooltip"
        style={getTooltipStyles()}
      >
        Contact Us
      </div>
      
      {/* Button */}
      <TouchOptimizedButton
        onClick={handleClick}
        className="floating-contact-button"
        style={getButtonStyles()}
        enableHapticFeedback={true}
        touchTargetSize={56}
        deadzoneSize={16}
      >
        💬
      </TouchOptimizedButton>
      
      {/* Enhanced styles */}
      <style>{`
        .floating-contact-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          isolation: isolate; /* Create new stacking context */
        }
        
        .floating-contact-button {
          position: relative;
          overflow: hidden;
          touch-action: manipulation; /* Prevent double-tap zoom and improve touch response */
          -webkit-touch-callout: none; /* Disable iOS callout */
          -webkit-user-select: none; /* Disable text selection */
          user-select: none;
          isolation: isolate; /* Create new stacking context */
        }
        
        /* Remove conflicting hover effects that cause blinking */
        .floating-contact-button:hover {
          transform: translateY(-2px);
        }
        
        .contact-tooltip::after {
          content: '';
          position: absolute;
          top: 50%;
          ${position.includes('left') ? 'right: -6px;' : 'left: -6px;'}
          transform: translateY(-50%);
          border: 6px solid transparent;
          ${position.includes('left') 
            ? 'border-left-color: rgba(0, 0, 0, 0.8);' 
            : 'border-right-color: rgba(0, 0, 0, 0.8);'
          }
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .floating-contact-container {
            ${position.includes('left') ? 'left: 16px;' : 'right: 16px;'}
            ${position.includes('bottom') ? 'bottom: 16px;' : 'top: 16px;'}
          }
          
          .floating-contact-button {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }
          
          .contact-tooltip {
            display: none; /* Hide tooltip on mobile */
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .floating-contact-container,
          .floating-contact-button,
          .contact-tooltip {
            transition: none;
          }
        }
        
        /* High contrast mode */
        @media (prefers-contrast: high) {
          .floating-contact-button {
            border: 2px solid #ffffff;
            background: #000000;
          }
          
          .contact-tooltip {
            background-color: #000000;
            border: 1px solid #ffffff;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingContactButton;
