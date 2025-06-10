import React, { useEffect } from 'react';
import styles from './IncomingCallNotification.module.css'; // Reuse existing styles
import { FiPhoneIncoming, FiPhoneOff, FiVideo } from 'react-icons/fi';
import Avatar from './Avatar';
import { ChatRoom } from './types';

interface GroupCallNotificationProps {
  callerName: string;
  callerAvatar?: string;
  callerId: string | number;
  room: ChatRoom | null;
  isAudioOnly: boolean;
  isGroupCall?: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const GroupCallNotification: React.FC<GroupCallNotificationProps> = ({
  callerName,
  callerAvatar,
  callerId,
  room,
  isAudioOnly,
  isGroupCall = false,
  onAccept,
  onReject
}) => {
  // Play ringtone when notification appears
  useEffect(() => {
    // Try to play ringtone if browser supports audio
    try {
      const audio = new Audio('/sounds/ringtone.mp3');
      audio.loop = true;
      
      // Handle browsers that require user interaction
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Could not autoplay ringtone (requires user interaction):', err);
        });
      }
      
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    } catch (err) {
      console.warn('Audio not supported in this browser:', err);
    }
  }, []);
  
  // Get call display name
  const getCallDisplayName = () => {
    if (isGroupCall && room) {
      return `Group Call: ${room.name}`;
    }
    return callerName;
  };
  
  return (
    <div className={styles.notification}>
      <div className={styles.notificationContent}>
        <Avatar
          name={callerName}
          avatar={callerAvatar}
          isOnline={true}
          isGroup={isGroupCall}
          size="medium"
        />
        <div className={styles.callInfo}>
          <div className={styles.callerName}>{getCallDisplayName()}</div>
          <div className={styles.callType}>
            Incoming {isAudioOnly ? 'voice' : 'video'} call
            {isGroupCall && ' (Group)'}
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={`${styles.actionButton} ${styles.acceptButton}`} onClick={onAccept}>
          {isAudioOnly ? <FiPhoneIncoming /> : <FiVideo />}
        </button>
        <button className={`${styles.actionButton} ${styles.rejectButton}`} onClick={onReject}>
          <FiPhoneOff />
        </button>
      </div>
    </div>
  );
};

export default GroupCallNotification;
