import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';

// Build the divider asset path using Vite's base so it works when served from /dev/
const dividerSrc = `${import.meta.env.BASE_URL}images/divider.png`;

import './TitleSection.scss';

interface TitleSectionProps {
  id: string; // Add an ID prop
  title: string;
  subtitle?: string;
  titleX?: string | number; // Optional prop for title X position
  triggerOnce?: boolean; // If false, animation can replay when re-entering
}

const TitleSection: React.FC<TitleSectionProps> = ({ id, title, subtitle, titleX, triggerOnce = true }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [svgWidth, setSvgWidth] = useState<string | number>('100%');

  const calculateSvgWidth = () => {
    if (svgRef.current) {

      // Use requestAnimationFrame to ensure SVG is rendered
      requestAnimationFrame(() => {
        if (svgRef.current) {
          const titleElement = svgRef.current.querySelector('.title');
          const subtitleElement = svgRef.current.querySelector('.subtitle');

          let maxWidth = 0;
          if (titleElement) {
            const titleBox = (titleElement as SVGGraphicsElement).getBBox();
            maxWidth = Math.max(maxWidth, titleBox.width);
          }
          if (subtitleElement) {
            const subtitleBox = (subtitleElement as SVGGraphicsElement).getBBox();
            maxWidth = Math.max(maxWidth, subtitleBox.width);
          }

          setSvgWidth(maxWidth + 20); // Add some padding
        }
      });
    }
  };

  // Measure text width as soon as layout is ready (useLayoutEffect to avoid flicker in Safari)
  useLayoutEffect(() => {
    calculateSvgWidth();
    // Recalculate after fonts load (Safari sometimes reports 0 widths before fonts ready)
    if ((document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => calculateSvgWidth());
    }
  }, [title, subtitle]);

  useEffect(() => {
    const handleResize = () => {
      calculateSvgWidth();
    };

    setTimeout(calculateSvgWidth, 200);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [title, subtitle]);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    let hasAnimated = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            // Entered viewport sufficiently
            if (!hasAnimated) {
              setIsVisible(true);
              hasAnimated = true;
            }
          } else if (!triggerOnce && hasAnimated && !entry.isIntersecting) {
            // Allow replay when leaving viewport if triggerOnce = false
            setIsVisible(false);
            hasAnimated = false;
          }
        });
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        root: null,
        rootMargin: '0px 0px 0px 0px', // precise triggering
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [triggerOnce]);

  return (
    <div className="title-section-wrapper">
      <div id={id} className="title-section" ref={containerRef}> {/* Add ID to the container */}
        <div id={`${id}-trigger`}className='trigger'></div>
        <div id={`${id}-section-trigger`}className='section-trigger'></div>
        <div className={`title-section-container ${isVisible ? 'animate' : ''}`}>
          <svg
            ref={svgRef}
            width={svgWidth}
            height="100%"
          >  
            <text x="0" y="10%" className='subtitle' textAnchor="start">
              <tspan x={titleX ?? "2%"} dy="1.2em">{subtitle}</tspan>
            </text>
          </svg>
          <img src={dividerSrc} alt="Divider" className="loader-divider" />
          <div className='title-section-content'>
            Ström’s history holds hidden treasures.
            <br />Will you uncover them all ? 
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleSection;