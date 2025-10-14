import React, { useState, useEffect } from 'react';
import TouchOptimizedButton from './TouchOptimizedButton';

interface StickyContactButtonProps {
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const StickyContactButton: React.FC<StickyContactButtonProps> = ({
  onClick,
  className = '',
  style = {}
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  // Show button after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000); // Show after 2 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Hide when user reaches footer area
  const shouldHide = scrollY > window.innerHeight * 3; // Hide after scrolling through most content
  
  // Get button styles
  const getButtonStyles = (): React.CSSProperties => ({
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 50%, #0d0d0d 100%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 'bold',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1000,
    opacity: isVisible && !shouldHide ? 1 : 0,
    visibility: isVisible && !shouldHide ? 'visible' : 'hidden',
    transform: isVisible && !shouldHide 
      ? (isHovered ? 'scale(1.1) translateY(-2px)' : 'scale(1)')
      : 'scale(0.8)',
    ...(isHovered && {
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
    }),
    ...style
  });
  
  // Get tooltip styles
  const getTooltipStyles = (): React.CSSProperties => ({
    position: 'absolute',
    right: '70px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
    zIndex: 1001,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  });
  
  const handleClick = () => {
    onClick?.();
    
    // Add click animation
    const button = document.querySelector('.sticky-contact-button') as HTMLElement;
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 150);
    }
  };
  
  return (
    <div
      className={`sticky-contact-container ${className}`}
      style={{ position: 'relative' }}
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
        className="sticky-contact-button"
        style={getButtonStyles()}
        enableHapticFeedback={true}
        touchTargetSize={60}
      >
        📧
      </TouchOptimizedButton>
      
      {/* Enhanced styles */}
      <style>{`
        .sticky-contact-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .sticky-contact-button {
          position: relative;
          overflow: hidden;
        }
        
        .sticky-contact-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }
        
        .sticky-contact-button:hover::before {
          left: 100%;
        }
        
        .contact-tooltip::after {
          content: '';
          position: absolute;
          top: 50%;
          right: -6px;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-left-color: rgba(0, 0, 0, 0.9);
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .sticky-contact-button {
            width: 52px !important;
            height: 52px !important;
            font-size: 18px !important;
            bottom: 16px !important;
            right: 16px !important;
          }
          
          .contact-tooltip {
            display: none; /* Hide tooltip on mobile */
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .sticky-contact-container,
          .sticky-contact-button,
          .contact-tooltip {
            transition: none !important;
          }
        }
        
        /* High contrast mode */
        @media (prefers-contrast: high) {
          .sticky-contact-button {
            border: 2px solid #ffffff !important;
            background: #000000 !important;
          }
          
          .contact-tooltip {
            background-color: #000000 !important;
            border: 1px solid #ffffff !important;
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .sticky-contact-button {
            background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #000000 100%) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StickyContactButton;
