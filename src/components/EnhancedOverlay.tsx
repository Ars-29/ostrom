import React, { useState, useEffect, useRef } from 'react';
import TouchOptimizedButton from './TouchOptimizedButton';

interface EnhancedOverlayProps {
  children: React.ReactNode;
  onClose: () => void;
  showCloseButton?: boolean;
  allowBackgroundClose?: boolean;
  showBackdrop?: boolean;
  backdropColor?: string;
  animationDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const EnhancedOverlay: React.FC<EnhancedOverlayProps> = ({
  children,
  onClose,
  showCloseButton = true,
  allowBackgroundClose = true,
  showBackdrop = true,
  backdropColor = 'rgba(0, 0, 0, 0.8)',
  animationDuration = 300,
  className = '',
  style = {}
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Show overlay with animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10); // Small delay to ensure DOM is ready
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle close with animation
  const handleClose = () => {
    if (isClosing) return; // Prevent double-closing
    
    setIsClosing(true);
    setIsVisible(false);
    
    setTimeout(() => {
      onClose();
    }, animationDuration);
  };
  
  // Handle background click
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (allowBackgroundClose && e.target === overlayRef.current) {
      handleClose();
    }
  };
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  // Prevent body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  // Get overlay styles
  const getOverlayStyles = (): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    opacity: isVisible ? 1 : 0,
    transition: `opacity ${animationDuration}ms ease-in-out`,
    ...(showBackdrop && {
      backgroundColor: backdropColor
    }),
    ...style
  });
  
  // Get content styles
  const getContentStyles = (): React.CSSProperties => ({
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    transform: isVisible ? 'scale(1)' : 'scale(0.9)',
    transition: `transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    ...(isClosing && {
      transform: 'scale(0.9)',
      opacity: 0
    })
  });
  
  // Get close button styles
  const getCloseButtonStyles = (): React.CSSProperties => ({
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    zIndex: 1,
    fontSize: '18px',
    color: '#666666',
    fontWeight: 'bold'
  });
  
  return (
    <div
      ref={overlayRef}
      className={`enhanced-overlay ${className}`}
      style={getOverlayStyles()}
      onClick={handleBackgroundClick}
    >
      <div
        ref={contentRef}
        className="overlay-content"
        style={getContentStyles()}
        onClick={(e) => e.stopPropagation()} // Prevent content clicks from closing overlay
      >
        {/* Close button */}
        {showCloseButton && (
          <TouchOptimizedButton
            onClick={handleClose}
            className="close-button"
            style={getCloseButtonStyles()}
            enableHapticFeedback={true}
            touchTargetSize={44}
          >
            ×
          </TouchOptimizedButton>
        )}
        
        {/* Content */}
        <div className="overlay-body">
          {children}
        </div>
      </div>
      
      {/* Enhanced styles */}
      <style>{`
        .enhanced-overlay {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        
        .overlay-content {
          position: relative;
        }
        
        .overlay-body {
          padding: 24px;
        }
        
        .close-button:hover {
          background-color: rgba(0, 0, 0, 0.2) !important;
          color: #333333 !important;
          transform: scale(1.1);
        }
        
        .close-button:active {
          transform: scale(0.95);
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .enhanced-overlay {
            padding: 10px;
          }
          
          .overlay-content {
            max-width: 95vw;
            max-height: 95vh;
          }
          
          .overlay-body {
            padding: 16px;
          }
          
          .close-button {
            top: 8px;
            right: 8px;
            width: 28px;
            height: 28px;
            font-size: 16px;
          }
        }
        
        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          .enhanced-overlay,
          .overlay-content {
            transition: none;
          }
        }
        
        /* High contrast mode */
        @media (prefers-contrast: high) {
          .overlay-content {
            border: 2px solid #000000;
          }
          
          .close-button {
            border: 2px solid #000000;
            background-color: #ffffff;
            color: #000000;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedOverlay;
