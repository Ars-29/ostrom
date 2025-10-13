import React from 'react';
import { useLabelInfo } from '../../contexts/LabelInfoContext';
import imgDividerSecret from '/images/secrets_divider.png';

import './ScoreDisplay.scss';

const sceneLabelCounts = [5, 6, 4]; // Street, Road, Plane order
const sceneOrder = ['street', 'road', 'plane'];

export const ScoreDisplay: React.FC = () => {
  const { state } = useLabelInfo();

  return (
    <div className="score-display">
      <div className='score-label'>Secrets found</div>
      <img src={imgDividerSecret} alt="Divider" className="score-divider" />
      <div className="score-display-group">
        {sceneOrder.map((scene, i) => {
          const total = sceneLabelCounts[i];
          const found = Object.values(state[scene] || {}).filter(Boolean).length;
          return (
            <span key={scene} className="score-diagonal">
              <span className="score-found">{found}</span>
              <span className="score-diagonal-bar"></span>
              <span className="score-total">{total}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
