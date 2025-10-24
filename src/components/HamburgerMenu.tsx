import React, { useState, useEffect, useRef } from 'react';
import TouchOptimizedButton from './TouchOptimizedButton';

interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: string;
  badge?: string;
}

interface HamburgerMenuProps {
  items: NavigationItem[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  position?: 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  items,
  isOpen,
  onToggle,
  onClose,
  position = 'left',
  className = '',
  style = {}
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Handle menu toggle animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Handle item click
  const handleItemClick = (item: NavigationItem) => {
    if (item.onClick) {
      item.onClick();
    }
    onClose();
  };
  
  // Get menu styles
  const getMenuStyles = (): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    [position]: 0,
    width: '280px',
    height: '100vh',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    transform: isOpen 
      ? 'translateX(0)' 
      : `translateX(${position === 'left' ? '-100%' : '100%'})`,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    ...style
  });
  
  // Get overlay styles
  const getOverlayStyles = (): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    zIndex: 999,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'all 0.3s ease'
  });
  
  // Get hamburger button styles - Modern design
  const getButtonStyles = (): React.CSSProperties => ({
    position: 'fixed',
    top: '50px',
    left: '15px', // Moved closer to left edge
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    zIndex: 1002, // Higher than TitleSection (1001) to ensure visibility
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    gap: '6px', // Increased gap for better spacing
    pointerEvents: 'auto', // Ensure only direct touches work
    touchAction: 'manipulation' // Prevent double-tap zoom
  });
  
  // Get hamburger line styles - Modern design with rounded ends
  const getLineStyles = (lineNumber: number): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      height: '2px',
      backgroundColor: '#000000',
      borderRadius: '2px', // Rounded ends
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isOpen 
        ? (lineNumber === 1 ? 'rotate(45deg) translate(6px, 6px)' :
           lineNumber === 2 ? 'opacity(0) scale(0)' :
           'rotate(-45deg) translate(6px, -6px)')
        : 'none'
    };

    // Progressive width design - each line shorter than the previous, all left-aligned
    if (!isOpen) {
      if (lineNumber === 1) {
        // Top line - longest
        baseStyles.width = '24px';
        baseStyles.alignSelf = 'flex-start';
      } else if (lineNumber === 2) {
        // Middle line - shorter than top
        baseStyles.width = '20px';
        baseStyles.alignSelf = 'flex-start';
      } else {
        // Bottom line - shortest
        baseStyles.width = '16px';
        baseStyles.alignSelf = 'flex-start';
      }
    } else {
      // When open, all lines have same width for animation
      baseStyles.width = '24px';
    }

    return baseStyles;
  };
  
  // Get menu header styles
  const getHeaderStyles = (): React.CSSProperties => ({
    padding: '20px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  });
  
  // Get menu items styles
  const getItemsStyles = (): React.CSSProperties => ({
    flex: 1,
    padding: '20px 0',
    overflowY: 'auto'
  });
  
  // Get item styles
  const getItemStyles = (): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    color: '#333333',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    borderLeft: '3px solid transparent'
  });
  
  return (
    <>
      {/* Overlay */}
      <div
        className="menu-overlay"
        style={getOverlayStyles()}
        onClick={onClose}
      />
      
       {/* Hamburger Button */}
       <TouchOptimizedButton
         onClick={onToggle}
         className="hamburger-button"
         style={getButtonStyles()}
         enableHapticFeedback={true}
         touchTargetSize={48}
         deadzoneSize={12}
       >
         <div style={getLineStyles(1)} />
         <div style={getLineStyles(2)} />
         <div style={getLineStyles(3)} />
       </TouchOptimizedButton>
      
      {/* Menu */}
      <div
        ref={menuRef}
        className={`hamburger-menu ${className}`}
        style={getMenuStyles()}
      >
        {/* Header */}
        <div style={getHeaderStyles()}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333333' }}>
            Menu
          </h3>
          <TouchOptimizedButton
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#666666'
            }}
            enableHapticFeedback={true}
            touchTargetSize={32}
          >
            ×
          </TouchOptimizedButton>
        </div>
        
        {/* Menu Items */}
        <div style={getItemsStyles()}>
          {items.map((item, index) => (
            <div
              key={item.id}
              className="menu-item"
              style={{
                ...getItemStyles(),
                animationDelay: `${index * 50}ms`,
                ...(isAnimating && {
                  opacity: 0,
                  transform: 'translateX(-20px)',
                  animation: 'slideInFromLeft 0.3s ease forwards'
                })
              }}
              onClick={() => handleItemClick(item)}
            >
              {item.icon && (
                <span style={{ marginRight: '12px', fontSize: '18px' }}>
                  {item.icon}
                </span>
              )}
              <span style={{ flex: 1, fontSize: '16px', fontWeight: '500' }}>
                {item.label}
              </span>
              {item.badge && (
                <span style={{
                  backgroundColor: '#667eea',
                  color: '#ffffff',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          fontSize: '14px',
          color: '#666666',
          textAlign: 'center'
        }}>
          © {new Date().getFullYear()} STROM
        </div>
      </div>
      
       {/* Enhanced styles */}
       <style>{`
        .menu-item:hover {
          background-color: rgba(102, 126, 234, 0.1) !important;
          border-left-color: #667eea !important;
          transform: translateX(4px);
        }
        
        .hamburger-button {
          isolation: isolate; /* Create new stacking context */
          touch-action: manipulation; /* Prevent double-tap zoom */
          -webkit-touch-callout: none; /* Disable iOS callout */
          -webkit-user-select: none; /* Disable text selection */
          user-select: none;
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        
        .hamburger-button:focus,
        .hamburger-button:active {
          background-color: transparent !important;
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          transform: none !important;
        }
        
        .hamburger-button:hover {
          background-color: transparent !important;
          transform: none;
        }
        
        .hamburger-button:hover > div {
          background-color: #000000 !important;
        }
        
        @keyframes slideInFromLeft {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .hamburger-menu {
            width: 100vw !important;
          }
          
          .hamburger-button {
            top: 25px !important;
            left: 8px !important; /* Moved closer to left edge on mobile */
            width: 44px !important;
            height: 44px !important;
            gap: 5px !important; /* Slightly smaller gap on mobile */
          }
          
          .hamburger-button > div {
            height: 2px !important; /* Thinner on mobile */
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .hamburger-menu,
          .menu-overlay,
          .hamburger-button,
          .menu-item {
            transition: none !important;
            animation: none !important;
          }
        }
        
        /* High contrast mode */
        @media (prefers-contrast: high) {
          .hamburger-menu {
            background-color: #ffffff !important;
            border: 2px solid #000000 !important;
          }
          
          .hamburger-button {
            background-color: #ffffff !important;
            border: 2px solid #000000 !important;
          }
          
          .menu-item {
            border-bottom: 1px solid #000000;
          }
        }
      `}</style>
    </>
  );
};

export default HamburgerMenu;
