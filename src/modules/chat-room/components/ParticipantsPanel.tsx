import React from 'react';
import styles from './ParticipantsPanel.module.css';
import { FiX } from 'react-icons/fi';
import { ChatRoom } from './types';
import Avatar from './Avatar';

interface ParticipantsPanelProps {
  activeRoom: ChatRoom | null;
  showParticipants: boolean;
  setShowParticipants: React.Dispatch<React.SetStateAction<boolean>>;
  userId: number | string;
}

const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  activeRoom,
  showParticipants,
  setShowParticipants,
  userId,
}) => {
  if (!activeRoom) {
    return null;
  }

  return (
    <div className={`${styles.participantsPanel} ${!showParticipants ? styles.participantsPanelHidden : ''}`}>
      <div className={styles.participantsHeader}>
        <div className={styles.participantsTitle}>
          Thành viên phòng chat {activeRoom?.isGroup ? `(${activeRoom.participants.length})` : ''}
        </div>
        <button 
          className={styles.closeButton} 
          onClick={() => setShowParticipants(false)}
        >
          <FiX />
        </button>
      </div>
      
      <div className={styles.participantsList}>
        {activeRoom?.participants.map((user, index) => {
          // Kiểm tra xem người dùng có phải là chủ phòng không
          const isRoomOwner = activeRoom.senderId && String(user.id) === String(activeRoom.senderId);
          const isCurrentUser = String(user.id) === String(userId);
          
          return (
            <div key={`participant-${user.id || index}`} className={styles.participantItem}>              <Avatar 
                name={user.name || 'User'} 
                avatar={user.avatar} 
                isOnline={user.isOnline}
              />
              <div className={styles.participantInfo}>
                <div className={styles.participantName}>
                  {user.name || 'Người dùng'}{' '}
                  {isCurrentUser && <span className={styles.currentUser}>(Bạn)</span>}
                  {isRoomOwner && <span className={styles.ownerBadge}>👑 Chủ phòng</span>}
                </div>
                <div className={styles.participantStatus}>
                  <span className={`${styles.onlineIndicator} ${user.isOnline ? styles.online : styles.offline}`}></span>
                  {user.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantsPanel;
