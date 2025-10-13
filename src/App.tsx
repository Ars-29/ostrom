import { SceneCanvas } from './components/SceneCanvas';
import Footer from './components/Footer/Footer';
import Intro from './components/Intro/Intro';
import TitleSection from './components/TitleSection/TitleSection';
import ReactLenis from 'lenis/react';
import MouseFollower from './components/MouseFollower/MouseFollower';
import Timeline from './components/Timeline/Timeline';
import { useEffect, useState } from 'react';
import Loader from './components/Loader/Loader';
import ScrollingText from './components/ScrollingText/ScrollingText';
import { OverlayImageProvider } from './contexts/OverlayImageContext';
import { ScoreDisplay } from './components/ScoreDisplay/ScoreDisplay';
import MuteButton from './components/MuteButton/MuteButton';
import { LabelInfoProvider } from './contexts/LabelInfoContext';
import { useScene } from './contexts/SceneContext';
import { useSound } from './contexts/SoundContext';
import FPSStats from './components/FPSStats';
import { useIsMobile } from './hooks/useIsMobile';

import './App.scss';

const debugMode = false;

const App = () => {
  const isMobile = useIsMobile(768);
  const [hasStarted, setHasStarted] = useState(false);
  const { setSoundEnabled } = useSound();
  const { currentScene } = useScene();
  const { setAmbient } = useSound();

  useEffect(() => {
    console.log('Scene changed:', currentScene, 'hasStarted:', hasStarted);
    // Only start ambient sounds after the intro (when hasStarted is true AND we're not on intro)
    if (hasStarted && currentScene !== 'intro') {
      console.log('Enabling ambient sound for scene:', currentScene);
      // Enable sound system when we start playing ambient sounds
      setSoundEnabled(true);
      // Map section id to ambient sound key
      if (currentScene === 'section-1') setAmbient('street');
      else if (currentScene === 'section-2') setAmbient('road');
      else if (currentScene === 'section-3') setAmbient('plane');
      else setAmbient(null);
    } else {
      console.log('Stopping ambient sound - intro or not started');
      // Ensure no ambient sound during intro or before start
      setAmbient(null);
    }
  }, [currentScene, setAmbient, hasStarted, setSoundEnabled]);

  const handleLoaderComplete = () => {
    setHasStarted(true);
    // Don't enable sound system here - let it be enabled when we actually need ambient sounds
  };

  return (
    <LabelInfoProvider>
      <OverlayImageProvider>
        <ReactLenis root={true}>
          <Loader onComplete={handleLoaderComplete} />
          <ScoreDisplay />
          {!isMobile && (<MouseFollower />)}
          {debugMode && (
            <FPSStats />
          )}
          {!debugMode && (
            <>
              <Intro hasStarted={hasStarted} />
              <Timeline />
              <TitleSection id="section-1" title='' subtitle='The Urban Pioneer' />
              <ScrollingText targetSection=".persona-space.persona-1">
                <div>
                  <p>&nbsp;</p>
                  <p>&nbsp;</p>
                  <p>&nbsp;</p>
                  <p>&nbsp;</p>
                  <p>At the crossroads of legacy and progress</p>
                  <p>The urban odyssey begins in Chaussée d’Antin</p>
                  <p>Shaped by elegance and velocity</p>
                  <p>A motorist of distinction, unbound by time and place</p>
                  <p>&nbsp;</p>
                </div>        
              </ScrollingText>
              <div className='persona-space persona-1'></div>
              <TitleSection id="section-2" title='' subtitle='Connoisseurs of speed' />
              <ScrollingText targetSection=".persona-space.persona-2">
                <div>
                  <p>&nbsp;</p>
                  <p>The thrum of the engine, the wind whipping past your face</p>
                  <p>The heady perfume of smoke, speed and grease  </p>
                  <p>Innovation at full tilt, grace under throttle</p>
                  <p>Tailored to shield, elegance as second skin</p>
                  <p>&nbsp;</p>
                </div>
              </ScrollingText>
              <div className='persona-space persona-2'></div>
              <TitleSection id="section-3" title='' subtitle='Above and Beyond' titleX="6%" />
              <ScrollingText targetSection=".persona-space.persona-3">
                <div>
                  <p>&nbsp;</p>
                  <p>&nbsp;</p>
                  <p>The first breath of sky, the world revealed afresh</p>
                  <p>New horizons, born in flight</p>
                  <p>Dressed to defy gravity</p>
                  <p>Weightless, fearless, free </p>
                  <p>&nbsp;</p>
                </div>
              </ScrollingText>
              <div className='persona-space persona-3'></div>
              <Footer />
            </>
          )}
          <SceneCanvas debugMode={debugMode} />
          <MuteButton />
        </ReactLenis>
      </OverlayImageProvider>
    </LabelInfoProvider>
  );
};

export default App;