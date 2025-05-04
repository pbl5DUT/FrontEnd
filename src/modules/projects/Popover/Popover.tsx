'use client';

import React, { useEffect, useRef, ReactNode } from 'react';
import styles from './Popover.module.css';

interface PopoverProps {
  children: ReactNode;
  onClose: () => void;
}

const Popover: React.FC<PopoverProps> = ({ children, onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent scrolling on the body when popover is open
    document.body.style.overflow = 'hidden';

    // Handle click outside
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Handle escape key
    const handleEscKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  return (
    <div className={styles.popoverOverlay}>
      <div className={styles.popoverContainer} ref={popoverRef}>
        {children}
      </div>
    </div>
  );
};

export default Popover;
