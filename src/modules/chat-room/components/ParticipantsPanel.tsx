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
  
  // Debug log để kiểm tra dữ liệu room truyền vào
  // React.useEffect(() => {
  //   if (activeRoom) {
  //     console.log('ParticipantsPanel received activeRoom:', {
  //       id: activeRoom.id,
  //       name: activeRoom.name,
  //       isGroup: activeRoom.isGroup,
  //       participantsCount: activeRoom.participants?.length || 0
  //     });
      
  //     if (Array.isArray(activeRoom.participants)) {
  //       console.log('Participants data:', activeRoom.participants.map(p => 
  //         ({id: p?.id, name: p?.name, isValid: p !== null && p !== undefined})
  //       ));
  //     } else {
  //       console.error('Participants is not an array:', activeRoom.participants);
  //     }
  //   }
  // }, [activeRoom]);
    // Hàm để đảm bảo người tham gia hợp lệ và có đầy đủ thông tin
  const getValidParticipants = () => {
    if (!activeRoom || !activeRoom.participants || !Array.isArray(activeRoom.participants)) {
      console.warn('Participants array is invalid:', activeRoom?.participants);
      return [];
    }
    
    // Lọc và chuẩn hóa dữ liệu người tham gia
    return activeRoom.participants
      .filter(user => user !== null && user !== undefined)
      .map(user => {
        // Extract user data properly from API response structure
        // The actual user object might be nested in a participant wrapper
        const userData = user.user || user;
        
        return {
          // Try multiple possible ID field names
          id: userData.user_id || userData.id || user.user_id || user.id || 
               `unknown-${Math.random().toString(36).substr(2, 9)}`,
          // Try multiple possible name field structures
          name: userData.full_name || userData.name || user.full_name || user.name || 
                'Người dùng không xác định',
          avatar: userData.avatar || user.avatar,
          isOnline: !!(userData.is_online || userData.isOnline || user.is_online || user.isOnline),
          lastSeen: userData.last_seen || userData.lastSeen || user.last_seen || user.lastSeen || ''
        };
      });
  };

  return (
    <div className={`${styles.participantsPanel} ${!showParticipants ? styles.participantsPanelHidden : ''}`}>
      <div className={styles.participantsHeader}>
        <div className={styles.participantsTitle}>
          Thành viên phòng chat {activeRoom?.isGroup ? `(${getValidParticipants().length})` : ''}
        </div>
        <button 
          className={styles.closeButton} 
          onClick={() => setShowParticipants(false)}
        >
          <FiX />
        </button>
      </div>
      <div className={styles.participantsList}>
        {getValidParticipants().length > 0 ? (
          getValidParticipants().map((user, index) => {            // Kiểm tra xem người dùng có phải là chủ phòng không
            const isRoomOwner = activeRoom.senderId && user.id && 
              String(user.id) === String(activeRoom.senderId);
            const isCurrentUser = user.id && String(user.id) === String(userId);
            /* Debug log removed */
            return (
              <div key={`participant-${user.id || index}`} className={styles.participantItem}>
                <Avatar 
                  name={user.name || 'Người dùng'} 
                  avatar={user.avatar} 
                  isOnline={user.isOnline || false}
                />
                <div className={styles.participantInfo}>
                  <div className={styles.participantName}>
                    {user.name || 'Người dùng không xác định'}{' '}
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
          })
        ) : (
          <div className={styles.noParticipants}>Không có thành viên nào trong phòng chat này.</div>
        )}
      </div>
    </div>
  );
};

export default ParticipantsPanel;
