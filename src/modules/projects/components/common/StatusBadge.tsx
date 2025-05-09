// components/common/StatusBadge.tsx
import React from 'react';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusClass = status.toLowerCase().replace(/\s+/g, '_');
  
  return (
    <span className={`${styles.statusBadge} ${styles[statusClass]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;