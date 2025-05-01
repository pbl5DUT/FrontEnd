import React from 'react';
import styles from './stat_card.module.css';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  percent?: number;
  isIncreasing?: boolean;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  percent,
  isIncreasing,
  subtitle,
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'success':
        return styles.success;
      case 'warning':
        return styles.warning;
      case 'danger':
        return styles.danger;
      case 'info':
        return styles.info;
      default:
        return styles.primary;
    }
  };

  return (
    <div className={`${styles.card} ${getColorClass()}`}>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.value}>{value}</div>

        {percent !== undefined && (
          <div className={styles.percent}>
            <span className={isIncreasing ? styles.up : styles.down}>
              {isIncreasing ? '↑' : '↓'} {percent}%
            </span>
            <span className={styles.subtitle}>
              {subtitle || 'So với tháng trước'}
            </span>
          </div>
        )}
      </div>

      {icon && <div className={styles.icon}>{icon}</div>}
    </div>
  );
};
