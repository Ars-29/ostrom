import React from 'react';
import { useSound } from '../../contexts/SoundContext';
import TouchOptimizedButton from '../TouchOptimizedButton';
import iconSoundOn from '/images/icon_sound_on.png';
import iconSoundOff from '/images/icon_sound_off.png';

import './MuteButton.scss';

const MuteButton: React.FC = () => {
  const { muted, toggleMute } = useSound();
  
  return (
    <TouchOptimizedButton
      onClick={toggleMute}
      className="mute-toggle-btn"
      enableHapticFeedback={true}
      touchTargetSize={48}
      style={{
        background: 'none',
        border: 'none',
        padding: '8px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <img
        src={muted ? iconSoundOff : iconSoundOn}
        alt={muted ? 'Sound off' : 'Sound on'}
        className="mute-toggle-icon"
        draggable="false"
        style={{
          width: '24px',
          height: '24px',
          pointerEvents: 'none'
        }}
      />
    </TouchOptimizedButton>
  );
};

export default MuteButton;
