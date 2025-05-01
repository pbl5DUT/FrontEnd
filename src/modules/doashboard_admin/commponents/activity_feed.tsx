import React from 'react';
import styles from './activity_feed.module.css';
import { SystemActivity } from '../types';

interface ActivityFeedProps {
  activities: SystemActivity[];
  className?: string;
  maxItems?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  className,
  maxItems = 10,
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

  const getActivityIcon = (targetType: SystemActivity['targetType']) => {
    switch (targetType) {
      case 'project':
        return '📁';
      case 'task':
        return '✓';
      case 'user':
        return '👤';
      case 'system':
        return '⚙️';
      case 'report':
        return '📊';
      default:
        return '•';
    }
  };

  const getActivityLink = (activity: SystemActivity) => {
    switch (activity.targetType) {
      case 'project':
        return `/projects/${activity.targetId}`;
      case 'task':
        return `/tasks/${activity.targetId}`;
      case 'user':
        return `/admin/users/${activity.targetId}`;
      case 'report':
        return `/reports/${activity.targetId}`;
      default:
        return '#';
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className={`${styles.activityFeed} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Hoạt động gần đây</h3>
        <button className={styles.viewAllButton}>Xem tất cả</button>
      </div>

      <div className={styles.timeline}>
        {displayedActivities.length === 0 ? (
          <div className={styles.noActivities}>
            Không có hoạt động nào gần đây
          </div>
        ) : (
          displayedActivities.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.activityIcon}>
                {getActivityIcon(activity.targetType)}
              </div>

              <div className={styles.activityContent}>
                <div className={styles.activityHeader}>
                  <div className={styles.userInfo}>
                    <img
                      src={
                        activity.user.avatar ||
                        '/assets/images/default-avatar.png'
                      }
                      alt={activity.user.name}
                      className={styles.userAvatar}
                    />
                    <span className={styles.userName}>
                      {activity.user.name}
                    </span>
                  </div>
                  <span className={styles.activityTime}>
                    {formatTime(activity.timestamp)}
                  </span>
                </div>

                <div className={styles.activityDescription}>
                  <span className={styles.actionText}>{activity.action}</span>
                  <a
                    href={getActivityLink(activity)}
                    className={styles.targetLink}
                  >
                    {activity.targetName}
                  </a>
                </div>

                {activity.details && (
                  <div className={styles.activityDetails}>
                    {activity.details}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {activities.length > maxItems && (
          <div className={styles.moreActivities}>
            <button className={styles.loadMoreButton}>
              Xem thêm {activities.length - maxItems} hoạt động
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
