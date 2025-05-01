import React from 'react';
import styles from './alert_list.module.css';
import { SystemAlert } from '../types';

interface AlertsListProps {
  alerts: SystemAlert[];
  onMarkAsRead: (alertId: number) => void;
  className?: string;
}

export const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  onMarkAsRead,
  className,
}) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSecs < 60) {
      return 'vừa xong';
    } else if (diffInMins < 60) {
      return `${diffInMins} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      return `${diffInDays} ngày trước`;
    }
  };

  const getAlertTypeIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getAlertTypeClass = (type: SystemAlert['type']) => {
    switch (type) {
      case 'warning':
        return styles.warning;
      case 'error':
        return styles.error;
      case 'success':
        return styles.success;
      case 'info':
      default:
        return styles.info;
    }
  };

  const getPriorityLabel = (priority: SystemAlert['priority']) => {
    switch (priority) {
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return '';
    }
  };

  const getPriorityClass = (priority: SystemAlert['priority']) => {
    switch (priority) {
      case 'high':
        return styles.highPriority;
      case 'medium':
        return styles.mediumPriority;
      case 'low':
        return styles.lowPriority;
      default:
        return '';
    }
  };

  return (
    <div className={`${styles.alertsContainer} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Thông báo hệ thống</h3>
        <button className={styles.viewAllButton}>Xem tất cả</button>
      </div>

      <div className={styles.alertsList}>
        {alerts.length === 0 ? (
          <div className={styles.noAlerts}>Không có thông báo</div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`${styles.alertItem} ${
                !alert.isRead ? styles.unread : ''
              } ${getAlertTypeClass(alert.type)}`}
            >
              <div className={styles.alertIcon}>
                {getAlertTypeIcon(alert.type)}
              </div>

              <div className={styles.alertContent}>
                <div className={styles.alertHeader}>
                  <h4 className={styles.alertTitle}>{alert.title}</h4>
                  <span className={styles.alertTime}>
                    {formatTime(alert.timestamp)}
                  </span>
                </div>

                <div className={styles.alertMessage}>{alert.message}</div>

                <div className={styles.alertFooter}>
                  <span
                    className={`${styles.priority} ${getPriorityClass(
                      alert.priority
                    )}`}
                  >
                    {getPriorityLabel(alert.priority)}
                  </span>

                  {!alert.isRead && (
                    <button
                      className={styles.markAsReadButton}
                      onClick={() => onMarkAsRead(alert.id)}
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
