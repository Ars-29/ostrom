import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

interface SoundContextType {
  setAmbient: (scene: 'street' | 'road' | 'plane' | null) => void;
  playEffect: (effect: 'click') => void;
  muted: boolean;
  toggleMute: () => void;
  enabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  registerVideo: (video: HTMLVideoElement) => void;
  unregisterVideo: (video: HTMLVideoElement) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const AMBIENT_SOUNDS: Record<string, string> = {
  street: 'mp3/street.mp3',
  road: 'mp3/road.mp3',
  plane: 'mp3/plane.mp3',
};
const EFFECT_SOUNDS: Record<string, string> = {
  click: 'mp3/click.mp3',
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [muted, setMuted] = useState(false);
  const [, setCurrentAmbient] = useState<string | null>(null);
  const [enabled, setSoundEnabled] = useState(false);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);
  const registeredVideos = useRef<Set<HTMLVideoElement>>(new Set());

  // Register video for mute control
  const registerVideo = useCallback((video: HTMLVideoElement) => {
    registeredVideos.current.add(video);
    video.muted = muted;
  }, [muted]);

  // Unregister video
  const unregisterVideo = useCallback((video: HTMLVideoElement) => {
    registeredVideos.current.delete(video);
  }, []);

  // Play ambient with fade in/out
  const setAmbient = useCallback((scene: 'street' | 'road' | 'plane' | null) => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
    
    if (ambientAudioRef.current) {
      // Fade out current ambient
      const audio = ambientAudioRef.current;
      let vol = audio.volume;
      const fadeOut = () => {
        if (vol > 0.05) {
          vol -= 0.05;
          audio.volume = Math.max(vol, 0);
          fadeTimeoutRef.current = window.setTimeout(fadeOut, 30);
        } else {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 1;
          ambientAudioRef.current = null;
          if (scene && AMBIENT_SOUNDS[scene] && enabled && !muted) {
            playAmbient(scene);
          } else {
            setCurrentAmbient(null);
          }
        }
      };
      fadeOut();
    } else if (scene && AMBIENT_SOUNDS[scene] && enabled && !muted) {
      playAmbient(scene);
    } else {
      setCurrentAmbient(null);
    }
    // eslint-disable-next-line
  }, [enabled, muted]);

  const playAmbient = (scene: 'street' | 'road' | 'plane') => {
    if (!enabled || muted) return; // Prevent ambient if muted
    console.log("playAmbient", scene);
    const src = AMBIENT_SOUNDS[scene];
    const audio = new window.Audio(import.meta.env.BASE_URL + src);
    audio.loop = true;
    audio.volume = 0;
    audio.muted = muted;
    audio.play();
    ambientAudioRef.current = audio;
    setCurrentAmbient(scene);
    // Fade in
    let vol = 0;
    const fadeIn = () => {
      if (vol < 1) {
        vol += 0.05;
        audio.volume = Math.min(vol, 1);
        fadeTimeoutRef.current = window.setTimeout(fadeIn, 30);
      } else {
        audio.volume = 1;
      }
    };
    fadeIn();
  };

  // Play effect (no fade, can overlap)
  const playEffect = useCallback((effect: 'click') => {
    if (!enabled) return;
    console.log("playEffect", effect);
    if (!EFFECT_SOUNDS[effect]) return;
    const audio = new window.Audio(import.meta.env.BASE_URL + EFFECT_SOUNDS[effect]);
    audio.volume = muted ? 0 : 0.2;
    audio.play();
  }, [muted, enabled]);

  // Mute/unmute all
  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const newMuted = !m;
      if (ambientAudioRef.current) ambientAudioRef.current.muted = newMuted;
      // Mute/unmute all registered videos
      registeredVideos.current.forEach(video => {
        video.muted = newMuted;
      });
      return newMuted;
    });
  }, []);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  // React to mute state
  React.useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.muted = muted;
    }
    // Update all registered videos
    registeredVideos.current.forEach(video => {
      video.muted = muted;
    });
  }, [muted]);

  return (
    <SoundContext.Provider value={{ setAmbient, playEffect, muted, toggleMute, enabled, setSoundEnabled, registerVideo, unregisterVideo }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within SoundProvider');
  return ctx;
};
