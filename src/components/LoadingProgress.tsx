import React from 'react';

interface LoadingProgressProps {
  progress: number;
  isVisible: boolean;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({ progress, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-progress-container">
      <div className="loading-progress-bar">
        <div 
          className="loading-progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="loading-progress-text">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default LoadingProgress;


