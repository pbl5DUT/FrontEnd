import React, { useState } from 'react';
import styles from './IncomingCallNotification.module.css';
import { FiPhoneIncoming, FiPhoneOff } from 'react-icons/fi';
import Avatar from './Avatar';

interface IncomingCallNotificationProps {
  callerName: string;
  callerAvatar?: string;
  isAudioOnly: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCallNotification: React.FC<IncomingCallNotificationProps> = ({
  callerName,
  callerAvatar,
  isAudioOnly,
  onAccept,
  onReject
}) => {
  return (
    <div className={styles.notification}>
      <div className={styles.notificationContent}>
        <Avatar
          name={callerName}
          avatar={callerAvatar}
          isOnline={true}
          size="medium"
        />
        <div className={styles.callInfo}>
          <div className={styles.callerName}>{callerName}</div>
          <div className={styles.callType}>
            Incoming {isAudioOnly ? 'voice' : 'video'} call
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={`${styles.actionButton} ${styles.acceptButton}`} onClick={onAccept}>
          <FiPhoneIncoming />
        </button>
        <button className={`${styles.actionButton} ${styles.rejectButton}`} onClick={onReject}>
          <FiPhoneOff />
        </button>
      </div>
    </div>
  );
};

export default IncomingCallNotification;

