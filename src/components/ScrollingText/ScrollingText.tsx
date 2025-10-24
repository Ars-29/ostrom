import React, { useEffect, useRef, useState } from 'react';
import './ScrollingText.scss';

interface ScrollingTextProps {
  targetSection: string; // Selector for the target section (e.g., '.persona-space.persona-1')
  children?: React.ReactNode; // Optional children prop for nested content
  disableBackground?: boolean; // Optional prop to disable transparent background circle
}

const ScrollingText: React.FC<ScrollingTextProps> = ({ targetSection, children, disableBackground = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(1); // Start outside the zone (at the bottom)
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const targetElement = document.querySelector(targetSection);

    if (!targetElement) return;

    const handleScroll = () => {
      const rect = targetElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate scroll progress (0 to 1) based on the target section visibility
      const progress = Math.min(
        Math.max(0, windowHeight - rect.top) / (windowHeight + rect.height),
        1
      );

      setScrollProgress(progress);

      // Determine visibility based on intersection with viewport
      setIsVisible(rect.top < windowHeight && rect.bottom > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [targetSection]);

  return (
    <>
      {!disableBackground && <div className={`scrolling-text-background ${isVisible ? 'visible' : ''}`}></div>}
      <div
        className={`scrolling-text-container ${isVisible ? 'visible' : ''}`}
        ref={containerRef}
      >
        <div
          className="scrolling-text"
          style={{ transform: `translateY(${(scrollProgress * 2 - 1) * -100}%)` }}
        >
          {children}
        </div>
        <div className="fade-mask top"></div>
        <div className="fade-mask bottom"></div>
      </div>
    </>
  );
};

export default ScrollingText;