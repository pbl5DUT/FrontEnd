import React from 'react';
import styles from './Avatar.module.css';
import { FiUsers } from 'react-icons/fi';

interface AvatarProps {
  name: string;
  avatar?: string;
  isOnline?: boolean;
  isGroup?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  avatar, 
  isOnline = false, 
  isGroup = false,
  size = 'medium'
}) => {  const sizeClass = size === 'small' ? styles.smallAvatar : size === 'large' ? styles.largeAvatar : '';
  
  if (isGroup) {
    return (
      <div className={`${styles.contactAvatar} ${sizeClass}`}>
        <div className={styles.groupAvatar}>
          <FiUsers />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.contactAvatar} ${sizeClass}`}>
      {avatar ? (
        <img src={avatar} alt={name} />
      ) : (
        <div className={styles.defaultAvatar}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      {isOnline && <span className={styles.onlineIndicator}></span>}
    </div>
  );
};

export default Avatar;
