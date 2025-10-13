import React, { createContext, useContext, useState, ReactNode } from 'react';
import OverlayImage from '../components/OverlayImage/OverlayImage';

interface OverlayImageContextProps {
  openImage: (imageUrl: string, text?: string) => void;
  closeImage: () => void;
}

const OverlayImageContext = createContext<OverlayImageContextProps | undefined>(undefined);

export const OverlayImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);

  const openImage = (url: string, label?: string) => {
    console.log('Opening image:', url, 'with text:', label);
    setImageUrl(url);
    setText(label || null);
  };
  const closeImage = () => {
    console.log('Closing image');
    setImageUrl(null);
    // setText(null);
  };

  return (
    <OverlayImageContext.Provider value={{ openImage, closeImage }}>
      {children}
      {imageUrl && <OverlayImage imageUrl={imageUrl} onClose={closeImage} text={text} />}
    </OverlayImageContext.Provider>
  );
};

export const useOverlayImage = (): OverlayImageContextProps => {
  const context = useContext(OverlayImageContext);
  if (!context) {
    throw new Error('useOverlayImage must be used within an OverlayImageProvider');
  }
  return context;
};
