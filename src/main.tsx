import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ScrollProgressProvider } from './contexts/ScrollProgressContext';
import { SoundProvider } from './contexts/SoundContext';
import { SceneProvider } from './contexts/SceneContext';

// Stable mobile viewport height: lock to initial visible height to avoid jump when URL bar hides/shows
function setStableAppHeight() {
  const h = window.innerHeight;
  document.documentElement.style.setProperty('--app-height', h + 'px');
}

// Only set once at start plus on orientation change / resize that is a real dimension change
setStableAppHeight();
let lastHeight = window.innerHeight;
window.addEventListener('resize', () => {
  // Ignore minor resize events triggered by UI chrome show/hide causing small fluctuations
  const current = window.innerHeight;
  if (Math.abs(current - lastHeight) > 80) { // threshold
    lastHeight = current;
    setStableAppHeight();
  }
});
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    lastHeight = window.innerHeight;
    setStableAppHeight();
  }, 300);
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ScrollProgressProvider>
      <SoundProvider>
        <SceneProvider>
          <App />
        </SceneProvider>
      </SoundProvider>
    </ScrollProgressProvider>
  </React.StrictMode>
);
