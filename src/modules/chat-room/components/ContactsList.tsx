import React from 'react';
import styles from './ContactsList.module.css';
import Avatar from './Avatar';
import { FiUsers } from 'react-icons/fi';
import { ChatRoom, ProjectUser } from './types';

interface ContactsListProps {
  activeTab: string;
  loading: boolean;
  error: string | null;
  loadingProjectUsers: boolean;
  projectUsersError: string | null;
  chatRooms: ChatRoom[];
  projectUsers: ProjectUser[];
  activeRoom: ChatRoom | null;
  searchTerm: string;
  handleContactClick: (contact: any) => void;
  startDirectChat: (userId: number) => Promise<any>;
  setActiveChatRoom: (room: ChatRoom) => void;
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
}) => {
  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  // Display recent chats
  if (activeTab === 'recent') {
    return (
      <>
        {chatRooms
          .filter(room => room.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((room) => (
            <div
              key={room.id}
              className={`${styles.contactItem} ${
                room.id === activeRoom?.id ? styles.activeContact : ''
              }`}
              onClick={() => handleContactClick(room)}
            >              <Avatar
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
          ))}
      </>
    );
  }

  // Display users
  if (activeTab === 'users') {
    if (loadingProjectUsers) {
      return <div className={styles.loading}>Đang tải danh sách người dùng dự án...</div>;
    }

    if (projectUsersError) {
      return <div className={styles.error}>{projectUsersError}</div>;
    }

    if (projectUsers.length === 0) {
      return <div className={styles.noResults}>Không có người dùng nào trong dự án của bạn</div>;
    }

    return (
      <>
        {projectUsers
          .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((projectUser) => {
            // Kiểm tra xem đã có phòng chat 1-1 với người dùng này chưa
            const existingChatRoom = chatRooms.find(room => {
              if (room.participants.length !== 2) return false;
              return room.participants.some(p => String(p.id) === String(projectUser.id));
            });
            
            const handleProjectUserClick = async () => {
              try {
                if (existingChatRoom) {
                  // Nếu đã có phòng chat, mở phòng chat đó
                  setActiveChatRoom(existingChatRoom);
                } else {
                  // Nếu chưa có, tạo phòng chat mới
                  const newRoom = await startDirectChat(projectUser.id);
                  if (newRoom) {
                    setActiveChatRoom(newRoom);
                  }
                }
              } catch (err) {
                console.error("Lỗi khi tạo phòng chat:", err);
              }
            };
            
            return (
              <div
                key={`project-user-${projectUser.id}`}
                className={`${styles.contactItem} ${styles.projectUserItem}`}
                onClick={handleProjectUserClick}
              >                <Avatar
                  name={projectUser.name}
                  avatar={projectUser.avatar}
                  isOnline={projectUser.isOnline}
                  isGroup={false}
                />
                <div className={styles.contactInfo}>
                  <div className={styles.contactName}>{projectUser.name}</div>
                  <div className={styles.projectInfo}>
                    {projectUser.projectName ? `Dự án: ${projectUser.projectName}` : 'Cùng dự án với bạn'}
                  </div>
                </div>
                {existingChatRoom && existingChatRoom.unreadCount > 0 && (
                  <div className={styles.unreadBadge}>{existingChatRoom.unreadCount}</div>
                )}
              </div>
            );
          })}
      </>
    );
  }

  // Display groups
  return (
    <>
      {chatRooms
        .filter(room => room.isGroup)
        .filter(room => room.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((room) => (
          <div
            key={room.id}
            className={`${styles.contactItem} ${
              room.id === activeRoom?.id ? styles.activeContact : ''
            }`}
            onClick={() => handleContactClick(room)}
          >            <Avatar
              name={room.name}
              isGroup={true}
            />
            <div className={styles.contactInfo}>
              <div className={styles.contactName}>{room.name}</div>
              <div className={styles.lastSeen}>
                {`${room.participants.length} participants`}
              </div>
            </div>
            {room.unreadCount > 0 && (
              <div className={styles.unreadBadge}>{room.unreadCount}</div>
            )}
          </div>
        ))}
    </>
  );
};

export default ContactsList;
