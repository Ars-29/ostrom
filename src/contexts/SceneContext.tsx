import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

interface SceneContextType {
  currentScene: string | null;
  setCurrentScene: (scene: string) => void;
}

const SceneContext = createContext<SceneContextType | undefined>(undefined);

export const SceneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScene, setCurrentScene] = useState<string | null>(null);

  // Memoize the setCurrentScene function to prevent unnecessary re-renders
  const memoizedSetCurrentScene = useCallback((scene: string) => {
    setCurrentScene(scene);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentScene,
    setCurrentScene: memoizedSetCurrentScene
  }), [currentScene, memoizedSetCurrentScene]);

  return (
    <SceneContext.Provider value={contextValue}>
      {children}
    </SceneContext.Provider>
  );
};

export const useScene = () => {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useScene must be used within SceneProvider');
  return ctx;
};
