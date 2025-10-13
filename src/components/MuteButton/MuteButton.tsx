import React from 'react';
import { useSound } from '../../contexts/SoundContext';
import iconSoundOn from '/images/icon_sound_on.png';
import iconSoundOff from '/images/icon_sound_off.png';

import './MuteButton.scss';

const MuteButton: React.FC = () => {
  const { muted, toggleMute } = useSound();
  return (
    <button
      className="mute-toggle-btn"
      onClick={toggleMute}
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
    >
      <img
        src={muted ? iconSoundOff : iconSoundOn}
        alt={muted ? 'Sound off' : 'Sound on'}
        className="mute-toggle-icon"
        draggable="false"
      />
    </button>
  );
};

export default MuteButton;
