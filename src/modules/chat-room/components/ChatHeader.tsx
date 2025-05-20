import React from 'react';
import styles from './ChatHeader.module.css';
import { FiSearch, FiPhone, FiVideo, FiMoreVertical, FiUsers } from 'react-icons/fi';
import { Contact } from './types';
import Avatar from './Avatar';

interface ChatHeaderProps {
  activeContact: Contact | null;
  showParticipants: boolean;
  setShowParticipants: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeContact,
  showParticipants,
  setShowParticipants,
}) => {
  if (!activeContact) {
    return (
      <div className={styles.chatHeader}>
        <div className={styles.emptyChatHeader}>
          Select a conversation to start chatting
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.chatHeader}>      <div className={styles.chatContact}>
        <Avatar 
          name={activeContact?.name || 'User'} 
          avatar={activeContact?.avatar} 
          isOnline={activeContact?.isOnline} 
          isGroup={false}
        />
        <div className={styles.contactInfo}>
          <div className={styles.contactName}>{activeContact?.name}</div>
          <div className={styles.lastSeen}>{activeContact?.lastSeen}</div>
        </div>
      </div>
      <div className={styles.chatActions}>
        <button className={styles.actionButton}>
          <FiSearch />
        </button>
        <button className={styles.actionButton}>
          <FiPhone />
        </button>
        <button className={styles.actionButton}>
          <FiVideo />
        </button>
        <button className={styles.actionButton}>
          <FiMoreVertical />
        </button>
        <button 
          className={`${styles.actionButton} ${showParticipants ? styles.activeButton : ''}`}
          onClick={() => setShowParticipants(!showParticipants)}
          title="Xem thành viên"
        >
          <FiUsers />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
