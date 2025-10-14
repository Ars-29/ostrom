import React, { useEffect, useState } from 'react';
import { useScene } from '../../contexts/SceneContext';

import './Timeline.scss';

const sections = [
  { id: 'intro', key: "intro", label: 'Intro' },
  { id: 'section-1-trigger', key: "section-1", label: 'The Urban <br/>Pioneer' },
  { id: 'section-2-trigger', key: "section-2", label: 'Connoisseurs <br/>of speed' },
  { id: 'section-3-trigger', key: "section-3", label: 'Above and <br/>Beyond' },
  { id: 'footer', key: "footer", label: 'The End' },
];

const Timeline: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { setCurrentScene } = useScene();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setActiveSection('intro');
        setCurrentScene('intro');
        return;
      }

      let lastActive: string | null = null;
      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const last50vh = window.innerHeight * 0.5;
      // If we're in the last 50vh of the page, activate footer
      if (docHeight - scrollBottom <= last50vh) {
        lastActive = 'footer';
      } else {
        sections.forEach((section) => {
          const element = document.getElementById(section.id);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + window.scrollY;
            
            if (window.scrollY >= elementTop - 0) {
              lastActive = section.key;
            }
          }
        });
      }
      setActiveSection(lastActive);
      if (lastActive) setCurrentScene(lastActive);
    };

    // Call once on mount to set initial state
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setCurrentScene]);

  const scrollToSection = (id: string) => {
    const selector = `#${id}`;
    const element = document.querySelector(selector);
    if (element) {
      // Use getBoundingClientRect() for consistent positioning
      const rect = element.getBoundingClientRect();
      console.log(rect);
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const targetPosition = rect.top + scrollTop;
      
      window.scrollTo({ top: targetPosition, behavior: "instant" });
    }
  };

  return (
    <div className="timeline">
      <div className="timeline-line"></div> {/* Add the line element */}
      {sections.map((section) => (
        <div
          key={section.id}
          className={`timeline-item active-follower ${activeSection === section.key ? 'active' : ''}`}
          onClick={() => scrollToSection(section.key + '-trigger')}
        >
          <span className="timeline-item-title" dangerouslySetInnerHTML={{__html: section.label}} />
        </div>
      ))}
    </div>
  );
};

export default Timeline;