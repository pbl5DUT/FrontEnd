// components/common/ProgressBar.tsx
import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number;
  showText?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, showText = true }) => {
  const progressValue = progress || 0;
  
  return (
    <div className={styles.progressContainer}>
      <div
        className={`${styles.progressBar} ${
          progressValue < 30
            ? styles.low
            : progressValue < 70
            ? styles.medium
            : styles.high
        }`}
        style={{ width: `${progressValue}%` }}
      ></div>
      {showText && <span className={styles.progressText}>{progressValue}%</span>}
    </div>
  );
};

export default ProgressBar;