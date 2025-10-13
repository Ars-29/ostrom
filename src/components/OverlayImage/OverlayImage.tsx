import React, { useState } from 'react';
import './OverlayImage.scss';

interface OverlayImageProps {
  imageUrl: string;
  onClose: () => void;
  text?: string | null; // Optional text to display below the image
}

const OverlayImage: React.FC<OverlayImageProps> = ({ imageUrl, onClose, text }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleClose = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onClose();
    }, 500); // Match the fade-out animation duration
  };

  return (
    <div className={`overlay ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="overlay-background" onClick={handleClose}></div>
      <button className="close-button" onClick={handleClose}>×</button>
      <div className="overlay-content">
        <div className="overlay-image-container">
          <img 
            src={import.meta.env.BASE_URL + 'images/' + imageUrl} 
            alt="Overlay" 
            className="overlay-image" 
          />
        </div>
        {text && (
          <div className='caption'>
            <div className='caption-text' dangerouslySetInnerHTML={{__html: text}}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverlayImage;
