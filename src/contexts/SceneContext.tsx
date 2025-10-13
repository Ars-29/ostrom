import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SceneContextType {
  currentScene: string | null;
  setCurrentScene: (scene: string) => void;
}

const SceneContext = createContext<SceneContextType | undefined>(undefined);

export const SceneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScene, setCurrentScene] = useState<string | null>(null);

  // Optionally, persist or sync scene here

  return (
    <SceneContext.Provider value={{ currentScene, setCurrentScene }}>
      {children}
    </SceneContext.Provider>
  );
};

export const useScene = () => {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useScene must be used within SceneProvider');
  return ctx;
};
