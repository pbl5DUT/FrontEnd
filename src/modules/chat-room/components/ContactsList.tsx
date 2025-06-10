import React from 'react';
import styles from './ContactsList.module.css';
import Avatar from './Avatar';
import { FiUsers, FiPhone, FiVideo } from 'react-icons/fi';
import { ChatRoom, ProjectUser } from './types';

interface ContactsListProps {
  activeTab: string;
  loading: boolean;
  error: string | null;
  loadingProjectUsers: boolean;
  projectUsersError: string | null;  chatRooms: ChatRoom[];
  projectUsers: ProjectUser[];
  activeRoom: ChatRoom | null;
  searchTerm: string;
  handleContactClick: (contact: any) => void;
  startDirectChat: (userId: number | string) => Promise<any>;
  setActiveChatRoom: (room: ChatRoom) => void;
  // Add these new props for call functionality
  onVoiceCallClick?: (userId: number | string, roomId: string | number) => void;
  onVideoCallClick?: (userId: number | string, roomId: string | number) => void;
  // Add refresh callback
  onRefreshProjectUsers?: () => void;
}

const ContactsList: React.FC<ContactsListProps> = ({
  activeTab,
  loading,
  error,
  loadingProjectUsers,
  projectUsersError,
  chatRooms,
  projectUsers,
  activeRoom,
  searchTerm,
  handleContactClick,
  startDirectChat,
  setActiveChatRoom,
  onVoiceCallClick,
  onVideoCallClick,
  onRefreshProjectUsers,
}) => {
  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }
  // Display recent chats
  if (activeTab === 'recent') {
    // Filter rooms that have messages and match the search term
    const roomsWithMessages = chatRooms.filter(
      room => room.lastMessage && room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If no rooms with messages are found, show a message
    if (roomsWithMessages.length === 0) {
      return (
        <div className={styles.contactsContainer}>
          <div className={styles.noChats}>Không có cuộc trò chuyện nào gần đây</div>
        </div>
      );
    }

    return (
      <div className={styles.contactsContainer}>
        {roomsWithMessages
          .sort((a, b) => {
            // Sort by last message timestamp, newest first
            if (a.lastMessage && b.lastMessage) {
              return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
            }
            return 0;
          })
          .map((room) => (
                       <div
              key={room.id}
              className={`${styles.contactItem} ${
                room.id === activeRoom?.id ? styles.activeContact : ''
              }`}
            >
              <div className={styles.contactMain} onClick={() => handleContactClick(room)}>
                <Avatar
                  name={room.name}
                  avatar={room.isGroup ? undefined : room.participants[0]?.avatar}
                  isOnline={room.isGroup ? false : room.participants[0]?.isOnline}
                  isGroup={room.isGroup}
                />
                <div className={styles.contactInfo}>
                  <div className={styles.contactName}>{room.name}</div>
                  <div className={styles.lastSeen}>
                    {room.lastMessage ? room.lastMessage.text.substring(0, 30) : 'No messages yet'}
                  </div>
                </div>
                {room.unreadCount > 0 && (
                  <div className={styles.unreadBadge}>{room.unreadCount}</div>
                )}
              </div>

              {!room.isGroup && onVoiceCallClick && onVideoCallClick && (
                <div className={styles.contactActions}>
                  <button 
                    className={styles.callButton} 
                    onClick={(e) => {
                      e.stopPropagation();
                      const participantId = room.participants.find(p => String(p.id) !== String(activeRoom?.senderId))?.id;
                      if (participantId) onVoiceCallClick(participantId, room.id);
                    }}
                    title="Voice call"
                  >
                    <FiPhone size={16} />
                  </button>
                  <button 
                    className={styles.callButton} 
                    onClick={(e) => {
                      e.stopPropagation();
                      const participantId = room.participants.find(p => String(p.id) !== String(activeRoom?.senderId))?.id;
                      if (participantId) onVideoCallClick(participantId, room.id);
                    }}
                    title="Video call"
                  >
                    <FiVideo size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    );
  }
  
  // Display users  
  if (activeTab === 'users') {
    if (loadingProjectUsers) {
      return <div className={styles.loading}>Đang tải danh sách người dùng hệ thống...</div>;
    }

    if (projectUsersError) {
      return (
        <div>
          <div className={styles.error}>{projectUsersError}</div>
          {onRefreshProjectUsers && (
            <button 
              onClick={onRefreshProjectUsers}
              style={{ padding: '8px 16px', margin: '10px 0', cursor: 'pointer' }}
            >
              Thử lại
            </button>
          )}
        </div>
      );
    }

    if (projectUsers.length === 0) {
      return (
        <div className={styles.contactsContainer}>
          <div className={styles.noResults}>Không có người dùng nào để hiển thị</div>
          {onRefreshProjectUsers && (
            <button 
              onClick={onRefreshProjectUsers}
              style={{ padding: '8px 16px', margin: '10px 0', cursor: 'pointer' }}
            >
              Làm mới danh sách
            </button>
          )}
        </div>
      );
    }
      return (
      <div className={styles.contactsContainer}>
        {onRefreshProjectUsers && (
          <div style={{ padding: '10px 0', textAlign: 'center' }}>
            <button 
              onClick={onRefreshProjectUsers}
              style={{ 
                padding: '5px 10px', 
                backgroundColor: '#4a76a8', 
                color: 'white', 
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Làm mới danh sách người dùng
            </button>
          </div>
        )}
        {projectUsers
          .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((user) => {
            // Kiểm tra xem đã có phòng chat 1-1 với người dùng này chưa
            const existingChatRoom = chatRooms.find(room => {
              if (room.participants.length !== 2) return false;
              return room.participants.some(p => String(p.id) === String(user.id));
            });
            
            const handleUserClick = async () => {
              try {
                if (existingChatRoom) {
                  setActiveChatRoom(existingChatRoom);
                } else {
                  console.log(`Starting direct chat with user ID: ${user.id}`);
                  const newRoom = await startDirectChat(user.id);
                  if (newRoom) {
                    setActiveChatRoom(newRoom);
                  } else {
                    console.error("Failed to create chat room: No room returned");
                  }
                }
              } catch (err) {
                console.error("Lỗi khi tạo phòng chat:", err);
                alert(`Không thể tạo phòng chat: ${err.message || 'Lỗi không xác định'}`);
              }
            };
            
            return (
              <div
                key={`user-${user.id}`}
                className={`${styles.contactItem} ${styles.userItem}`}
              >
                <div className={styles.contactMain} onClick={handleUserClick}>
                  <Avatar
                    name={user.name}
                    avatar={user.avatar}
                    isOnline={user.isOnline}
                    isGroup={false}
                  />
                  <div className={styles.contactInfo}>
                    <div className={styles.contactName}>{user.name}</div>
                    <div className={styles.userInfo}>
                      {user.isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                  {existingChatRoom && existingChatRoom.unreadCount > 0 && (
                    <div className={styles.unreadBadge}>{existingChatRoom.unreadCount}</div>
                  )}
                </div>

                {onVoiceCallClick && onVideoCallClick && (
                  <div className={styles.contactActions}>
                    <button 
                      className={styles.callButton} 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (existingChatRoom?.id) {
                          onVoiceCallClick(user.id, existingChatRoom.id);
                        }
                      }}
                      title="Voice call"
                      disabled={!existingChatRoom?.id}
                    >
                      <FiPhone size={16} />
                    </button>
                    <button 
                      className={styles.callButton} 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (existingChatRoom?.id) {
                          onVideoCallClick(user.id, existingChatRoom.id);
                        }
                      }}
                      title="Video call"
                      disabled={!existingChatRoom?.id}
                    >
                      <FiVideo size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    );
  }
  // Display groups (if not users or recent)
  if (activeTab === 'groups') {
    const groupRooms = chatRooms
      .filter(room => room.isGroup)
      .filter(room => room.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // If no group rooms are found, show a message
    if (groupRooms.length === 0) {
      return (
        <div className={styles.contactsContainer}>
          <div className={styles.noChats}>Không có nhóm chat nào</div>
        </div>
      );
    }
    
    return (
      <div className={styles.contactsContainer}>
        {groupRooms
          .map((room) => (
          <div
            key={room.id}
            className={`${styles.contactItem} ${
              room.id === activeRoom?.id ? styles.activeContact : ''
            }`}
            onClick={() => handleContactClick(room)}
          >
            <Avatar
              name={room.name}
              isGroup={true}
            />
            <div className={styles.contactInfo}>
              <div className={styles.contactName}>{room.name}</div>
              <div className={styles.lastSeen}>
                {`${room.participants.length} thành viên`}
              </div>
            </div>
            {room.unreadCount > 0 && (
              <div className={styles.unreadBadge}>{room.unreadCount}</div>
            )}          </div>
        ))}
      </div>
    );
  }
  
  // Default case - should not happen with proper tabs
  return (
    <div className={styles.contactsContainer}>
      <div className={styles.noChats}>Vui lòng chọn một tab</div>
    </div>
  );
};

export default ContactsList;