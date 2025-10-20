import { useEffect, useRef, useState } from 'react';
import './Intro.scss';
import introVideo from '/videos/intro.mp4';
import introMobileVideo from '/mobile-assets/videos/intro_mobile_ultra.mp4';
import { useSound } from '../../contexts/SoundContext';

interface IntroProps { hasStarted: boolean; }

const Intro: React.FC<IntroProps> = ({ hasStarted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false); // fallback if play() fails even after start
  const { registerVideo, unregisterVideo } = useSound();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Register/unregister video for mute management only
  useEffect(() => {
    if (videoRef.current) {
      registerVideo(videoRef.current);
      // Ensure it's paused until hasStarted
      if (!hasStarted) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
    return () => { if (videoRef.current) unregisterVideo(videoRef.current); };
  }, [registerVideo, unregisterVideo, hasStarted]);

  // Start playback only after the journey has begun
  useEffect(() => {
    if (!hasStarted || !videoRef.current) return;
    const v = videoRef.current;
    const playPromise = v.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => setShowPlayButton(false)).catch(() => {
        // If this still fails (should be unlikely since video is muted), show manual play button
        setShowPlayButton(true);
      });
    }
  }, [hasStarted]);

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (videoRef.current) {
          // Only manage playback visibility AFTER start
          if (!hasStarted) return;
          if (entry.isIntersecting) {
            const playPromise = videoRef.current.play();
            if (playPromise) playPromise.catch(() => setShowPlayButton(true));
          } else {
            videoRef.current.pause();
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.5, // Adjust threshold as needed
    });

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [hasStarted]);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  const handlePlayClick = () => {
    if (!videoRef.current) return;
    videoRef.current.play().then(() => setShowPlayButton(false)).catch((error) => {
      console.error('Failed to play video manually:', error);
    });
  };

  return (
    <div className="intro" id="intro-trigger">
      <video
        ref={videoRef}
        className="intro__video"
        src={isMobile ? introMobileVideo : introVideo}
        // Removed autoPlay: we manually start after loader completion
        muted
        loop
        playsInline
        preload={isMobile ? "auto" : "metadata"}
      ></video>
      {hasStarted && showPlayButton && (
        <div className="intro__play-button" onClick={handlePlayClick}>
          <div className="play-icon">
            <svg width="20px" height="20px" viewBox="-3 0 28 28" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="Icon-Set-Filled" transform="translate(-419.000000, -571.000000)" fill="currentColor">
                        <path d="M440.415,583.554 L421.418,571.311 C420.291,570.704 419,570.767 419,572.946 L419,597.054 C419,599.046 420.385,599.36 421.418,598.689 L440.415,586.446 C441.197,585.647 441.197,584.353 440.415,583.554" id="play"></path>
                    </g>
                </g>
            </svg>
          </div>
        </div>
      )}
      <div className="intro__arrow active-follower" onClick={scrollToContent}>
        <span></span>
      </div>
      <div className='gradient-under'></div>
    </div>
  );
};

export default Intro;