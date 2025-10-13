import React, { useEffect, useState } from 'react';
import Logo from '../Logo/Logo';
import imgDivider from '../../../public/images/divider.png';

import './Loader.scss';

interface LoaderProps {
  onComplete: () => void;
}

const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [complete, setComplete] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const simulateFakeProgress = () => {
      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress += Math.random() * 10;
        if (fakeProgress >= 90) fakeProgress = 90; // Cap fake progress at 90%
        setProgress(Math.round(fakeProgress));
      }, 200);
      return interval;
    };

    const handlePageLoad = () => {
      setTimeout(() => {
        setProgress(100); // Set progress to 100% when the page is fully loaded
        setReady(true);
      }, 1000); // Wait for fade-out animation
    };

    const fakeProgressInterval = simulateFakeProgress();

    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      window.addEventListener('load', handlePageLoad);
    }

    return () => {
      clearInterval(fakeProgressInterval);
      window.removeEventListener('load', handlePageLoad);
    };
  }, []);

  // Only set ready when progress is 100
  useEffect(() => {
    if (progress === 100 && !ready) {
      setReady(true);
    }
  }, [progress, ready]);

  const handleStart = () => {
    // Re-enable scrolling when starting
    document.body.classList.remove('no-scroll');
    
    setIsFadingOut(true);
    setTimeout(() => {
      setComplete(true); // Set complete to true after fade-out
      onComplete(); // Call the onComplete callback
    }, 1000); // Wait for fade-out animation
  };
  
  useEffect(() => {
    // Disable scrolling by adding no-scroll class to body
    document.body.classList.add('no-scroll');
    
    // Force scroll to top on initial page load
    window.scrollTo(0, 0);
    setTimeout(() => {
      if (window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
    }, 100); // Adjust the timeout as needed

    // Cleanup: remove no-scroll class when component unmounts
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  return (
    <>
      <Logo className={`loader-logo ${isFadingOut ? 'move-to-corner' : ''}`} />
      {!complete && (
        <div className={`loader ${isFadingOut ? 'fade-out' : ''}`}>
          {!ready && (
            <div className="loader-progress">
              <div className="loader-progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          )}
          {ready && (
            <>
              <img src={imgDivider} alt="Divider" className="loader-divider" />
              <button className="loader-start-btn" onClick={handleStart}>
                <span className="btn-text">
                  {"Begin the journey".split("").map((letter, index) => (
                    <span 
                      key={index} 
                      className="letter" 
                      style={{ 
                        '--index': index,
                        animationDelay: `${index * 0.05}s` 
                      } as React.CSSProperties}
                      data-letter={letter === " " ? "\u00A0" : letter}
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </span>
                  ))}
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Loader;