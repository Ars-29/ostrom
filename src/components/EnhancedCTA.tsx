import React, { useState, useEffect } from 'react';
import TouchOptimizedButton from './TouchOptimizedButton';

interface EnhancedCTAProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'hidden-treasures' | 'light-theme' | 'white-button';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  showPulse?: boolean;
  showGlow?: boolean;
}

export const EnhancedCTA: React.FC<EnhancedCTAProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  className = '',
  style = {},
  disabled = false,
  showPulse = false,
  showGlow = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered] = useState(false);
  
  // Enhanced visibility for Hidden Treasures CTA
  const isHiddenTreasures = variant === 'hidden-treasures';
  
  // Auto-show CTA after a delay for better visibility
  useEffect(() => {
    if (isHiddenTreasures) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000); // Show after 2 seconds
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [isHiddenTreasures]);
  
  // Get variant-specific styles
  const getVariantStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      textDecoration: 'none',
      borderRadius: '8px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      ...style
    };
    
    switch (variant) {
      case 'hidden-treasures':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 50%, #0d0d0d 100%)',
          color: '#ffffff',
          padding: size === 'small' ? '8px 16px' : size === 'large' ? '16px 32px' : '12px 24px',
          fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          ...(showGlow && {
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.2), 0 4px 15px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }),
          ...(showPulse && {
            animation: 'pulse-glow-dark 2s infinite'
          })
        };
        
      case 'primary':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #404040 0%, #2a2a2a 50%, #1a1a1a 100%)',
          color: '#ffffff',
          padding: size === 'small' ? '8px 16px' : size === 'large' ? '16px 32px' : '12px 24px',
          fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        };
        
      case 'light-theme':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, rgba(240, 240, 240, 0.8) 0%, rgba(220, 220, 220, 0.9) 50%, rgba(200, 200, 200, 0.95) 100%)',
          color: '#1a1a1a',
          padding: size === 'small' ? '8px 16px' : size === 'large' ? '16px 32px' : '12px 24px',
          fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(180, 180, 180, 0.3)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          ...(showGlow && {
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.2), 0 4px 15px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 0 rgba(0, 0, 0, 0.15)'
          }),
          ...(showPulse && {
            animation: 'pulse-glow-glass 2s infinite'
          })
        };
        
      case 'white-button':
        return {
          ...baseStyles,
          background: '#ffffff',
          color: '#1a1a1a',
          padding: size === 'small' ? '8px 16px' : size === 'large' ? '16px 32px' : '12px 24px',
          fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          ...(showGlow && {
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.3), 0 4px 15px rgba(0, 0, 0, 0.2)'
          }),
          ...(showPulse && {
            animation: 'pulse-glow-white 2s infinite'
          })
        };
        
      case 'secondary':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          padding: size === 'small' ? '8px 16px' : size === 'large' ? '16px 32px' : '12px 24px',
          fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)'
        };
        
      default:
        return baseStyles;
    }
  };
  
  // Get visibility styles
  const getVisibilityStyles = (): React.CSSProperties => {
    if (!isVisible) {
      return {
        opacity: 0,
        transform: 'translateY(20px) scale(0.9)',
        pointerEvents: 'none'
      };
    }
    
    return {
      opacity: 1,
      transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
      pointerEvents: 'auto'
    };
  };
  
  return (
    <>
      <TouchOptimizedButton
        onClick={onClick}
        disabled={disabled}
        className={`enhanced-cta ${variant} ${size} ${className}`}
        style={{
          ...getVariantStyles(),
          ...getVisibilityStyles()
        }}
        enableHapticFeedback={true}
        touchTargetSize={size === 'small' ? 44 : size === 'large' ? 56 : 48}
      >
        {children}
        
        {/* Hidden Treasures specific enhancements */}
        {isHiddenTreasures && (
          <>
            {/* Sparkle effect */}
            <div className="sparkle-effect">
              <div className="sparkle sparkle-1"></div>
              <div className="sparkle sparkle-2"></div>
              <div className="sparkle sparkle-3"></div>
            </div>
            
            {/* Glow effect */}
            {showGlow && <div className="glow-effect"></div>}
          </>
        )}
      </TouchOptimizedButton>
      
      {/* Enhanced styles */}
      <style>{`
        .enhanced-cta {
          position: relative;
          overflow: hidden;
        }
        
        .enhanced-cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .enhanced-cta:hover::before {
          left: 100%;
        }
        
        .sparkle-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #ffffff;
          border-radius: 50%;
          animation: sparkle-animation 2s infinite;
        }
        
        .sparkle-1 {
          top: 20%;
          left: 20%;
          animation-delay: 0s;
        }
        
        .sparkle-2 {
          top: 60%;
          right: 20%;
          animation-delay: 0.7s;
        }
        
        .sparkle-3 {
          bottom: 20%;
          left: 50%;
          animation-delay: 1.4s;
        }
        
        .glow-effect {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          border-radius: 10px;
          z-index: -1;
          filter: blur(8px);
          opacity: 0.6;
        }
        
        @keyframes sparkle-animation {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse-glow-white {
          0%, 100% {
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3), 0 4px 15px rgba(0, 0, 0, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.4), 0 6px 20px rgba(0, 0, 0, 0.3);
          }
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .enhanced-cta {
            min-height: 48px;
            font-size: 16px;
          }
          
          .sparkle {
            display: none; /* Hide sparkles on mobile for performance */
          }
        }
      `}</style>
    </>
  );
};

export default EnhancedCTA;
