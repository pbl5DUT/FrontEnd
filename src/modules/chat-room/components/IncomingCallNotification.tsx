import React, { useEffect, useState } from 'react';
import styles from './IncomingCallNotification.module.css';
import { FiPhoneIncoming, FiPhoneOff, FiVideo } from 'react-icons/fi';
import Avatar from './Avatar';
import { ChatRoom } from './types';

interface IncomingCallNotificationProps {
  callerName: string;
  callerAvatar?: string;
  callerId: string | number;
  room: ChatRoom | null;
  isAudioOnly: boolean;
  isGroupCall?: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCallNotification: React.FC<IncomingCallNotificationProps> = ({
  callerName,
  callerAvatar,
  callerId,
  room,
  isAudioOnly,
  isGroupCall = false,
  onAccept,
  onReject
}) => {
  const [ringDuration, setRingDuration] = useState<number>(0);
  const ringTimeout = 60; // Auto-reject call after 60 seconds

  // Play ringtone when notification appears
  useEffect(() => {
    // Try to play ringtone if browser supports audio
    let audio: HTMLAudioElement | null = null;
    try {
      audio = new Audio('/sounds/ringtone.mp3');
      audio.loop = true;
      
      // Handle browsers that require user interaction
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Could not autoplay ringtone (requires user interaction):', err);
        });
      }
    } catch (err) {
      console.warn('Audio not supported in this browser:', err);
    }
    
    // Set timer for auto-reject
    const timer = setInterval(() => {
      setRingDuration(prev => {
        if (prev >= ringTimeout - 1) {
          clearInterval(timer);
          onReject(); // Auto-reject after timeout
          return ringTimeout;
        }
        return prev + 1;
      });
    }, 1000);
    
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      clearInterval(timer);
    };
  }, [onReject, ringTimeout]);
  
  // Get call display name
  const getCallDisplayName = () => {
    if (isGroupCall && room) {
      return `Group Call: ${room.name}`;
    }
    return callerName;
  };

  // Format remaining time
  const getRemainingTime = () => {
    const remaining = ringTimeout - ringDuration;
    return `${remaining}s`;
  };
  
  return (
    <div className={styles.notification}>
      <div className={styles.notificationHeader}>
        <div className={styles.pulsingDot}></div>
        <span>Incoming {isAudioOnly ? 'Voice' : 'Video'} Call</span>
        <span className={styles.timer}>{getRemainingTime()}</span>
      </div>
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
            {isAudioOnly ? 'Voice' : 'Video'} call
            {isGroupCall && ' (Group)'}
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <button 
          className={`${styles.actionButton} ${styles.acceptButton}`} 
          onClick={onAccept}
          aria-label={`Accept ${isAudioOnly ? 'voice' : 'video'} call`}
        >
          {isAudioOnly ? <FiPhoneIncoming size={20} /> : <FiVideo size={20} />}
          <span>Accept</span>
        </button>
        <button 
          className={`${styles.actionButton} ${styles.rejectButton}`} 
          onClick={onReject}
          aria-label="Reject call"
        >
          <FiPhoneOff size={20} />
          <span>Decline</span>
        </button>
      </div>
    </div>
  );
};

export default IncomingCallNotification;

