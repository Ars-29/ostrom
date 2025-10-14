import React, { useState, useEffect } from 'react';

interface TextReadabilityProps {
  children: React.ReactNode;
  variant?: 'overlay' | 'background' | 'outline' | 'shadow' | 'light-card' | 'no-background';
  intensity?: 'light' | 'medium' | 'strong';
  color?: string;
  backgroundColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  lineHeight?: 'tight' | 'normal' | 'relaxed';
  className?: string;
  style?: React.CSSProperties;
}

export const TextReadability: React.FC<TextReadabilityProps> = ({
  children,
  variant = 'overlay',
  intensity = 'medium',
  color = '#ffffff',
  backgroundColor = '#ffffff',
  fontSize = 'medium',
  lineHeight = 'normal',
  className = '',
  style = {}
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Show with animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get variant-specific styles
  const getVariantStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      color,
      transition: 'all 0.3s ease',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
      ...style
    };
    
    switch (variant) {
      case 'no-background':
        return {
          ...baseStyles,
          position: 'relative',
          padding: '24px 28px',
          borderRadius: '0px',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          color: '#1a1a1a',
          fontWeight: '500'
        };
        
      case 'light-card':
        return {
          ...baseStyles,
          position: 'relative',
          padding: '24px 28px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(250, 250, 250, 0.9) 0%, rgba(245, 245, 245, 0.95) 100%)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(200, 200, 200, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          color: '#1a1a1a',
          fontWeight: '500'
        };
        
      case 'overlay':
        return {
          ...baseStyles,
          position: 'relative',
          padding: '20px 24px',
          borderRadius: '12px',
          background: intensity === 'light' 
            ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(40, 40, 40, 0.8) 100%)'
            : intensity === 'strong'
            ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(20, 20, 20, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(0, 0, 0, 0.75) 0%, rgba(30, 30, 30, 0.85) 100%)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
          color: '#ffffff',
          fontWeight: '500'
        };
        
      case 'background':
        return {
          ...baseStyles,
          backgroundColor: backgroundColor,
          padding: '12px 16px',
          borderRadius: '6px',
          border: '1px solid rgba(0, 0, 0, 0.1)'
        };
        
      case 'outline':
        return {
          ...baseStyles,
          textShadow: `
            -1px -1px 0 ${backgroundColor},
            1px -1px 0 ${backgroundColor},
            -1px 1px 0 ${backgroundColor},
            1px 1px 0 ${backgroundColor}
          `,
          WebkitTextStroke: `1px ${backgroundColor}`
        };
        
      case 'shadow':
        return {
          ...baseStyles,
          textShadow: `
            0 0 10px ${backgroundColor},
            0 0 20px ${backgroundColor},
            0 0 30px ${backgroundColor}
          `
        };
        
      default:
        return baseStyles;
    }
  };
  
  // Get font size styles
  const getFontSizeStyles = (): React.CSSProperties => {
    switch (fontSize) {
      case 'small':
        return { fontSize: '14px' };
      case 'large':
        return { fontSize: '18px' };
      default:
        return { fontSize: '16px' };
    }
  };
  
  // Get line height styles
  const getLineHeightStyles = (): React.CSSProperties => {
    switch (lineHeight) {
      case 'tight':
        return { lineHeight: '1.2' };
      case 'relaxed':
        return { lineHeight: '1.6' };
      default:
        return { lineHeight: '1.4' };
    }
  };
  
  // Get combined styles
  const getCombinedStyles = (): React.CSSProperties => ({
    ...getVariantStyles(),
    ...getFontSizeStyles(),
    ...getLineHeightStyles(),
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '500',
    letterSpacing: '0.01em'
  });
  
  return (
    <div
      className={`text-readability ${variant} ${intensity} ${fontSize} ${lineHeight} ${className}`}
      style={getCombinedStyles()}
    >
      {children}
      
      {/* Enhanced styles */}
      <style>{`
        .text-readability {
          word-wrap: break-word;
          hyphens: auto;
        }
        
        .text-readability.overlay {
          position: relative;
          overflow: hidden;
        }
        
        .text-readability.overlay::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }
        
        .text-readability.overlay:hover::before {
          left: 100%;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .text-readability {
            padding: 12px 16px !important;
            font-size: 15px !important;
            line-height: 1.5 !important;
          }
          
          .text-readability.large {
            font-size: 17px !important;
          }
          
          .text-readability.small {
            font-size: 13px !important;
          }
        }
        
        /* High contrast mode */
        @media (prefers-contrast: high) {
          .text-readability.overlay {
            background-color: #ffffff !important;
            color: #000000 !important;
            border: 2px solid #000000 !important;
          }
          
          .text-readability.background {
            background-color: #ffffff !important;
            color: #000000 !important;
            border: 2px solid #000000 !important;
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .text-readability {
            transition: none !important;
            animation: none !important;
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .text-readability.overlay {
            background-color: rgba(0, 0, 0, 0.8) !important;
            color: #ffffff !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
          }
          
          .text-readability.background {
            background-color: #1a1a1a !important;
            color: #ffffff !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TextReadability;
