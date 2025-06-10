import React from 'react';
import styles from './Sidebar.module.css';
import { FiPlus } from 'react-icons/fi';
import SearchBox from './SearchBox';
import Tabs from './Tabs';
import ContactsList from './ContactsList';
import { ChatRoom, ProjectUser } from './types';

interface SidebarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string | null;
  chatRooms: ChatRoom[];
  projectUsers: ProjectUser[];
  loadingProjectUsers: boolean;
  projectUsersError: string | null;
  activeRoom: ChatRoom | null;
  setActiveChatRoom: (room: ChatRoom) => void;
  startDirectChat: (userId: number | string) => Promise<any>;
  setShowNewChatModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleContactClick: (contact: any) => void;
  // Add these new props for call functionality
  onVoiceCallClick?: (userId: number | string, roomId: string | number) => void;
  onVideoCallClick?: (userId: number | string, roomId: string | number) => void;
  // Add refresh callback for user list
  onRefreshProjectUsers?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  loading,
  error,
  chatRooms,
  projectUsers,
  loadingProjectUsers,
  projectUsersError,
  activeRoom,
  setActiveChatRoom,
  startDirectChat,
  setShowNewChatModal,
  handleContactClick,
  onVoiceCallClick,
  onVideoCallClick,
  onRefreshProjectUsers,
}) => {
  return (
    <div className={styles.sidebar}>
      <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className={styles.contactsList}>        <ContactsList
          activeTab={activeTab}
          loading={loading}
          error={error}
          loadingProjectUsers={loadingProjectUsers}
          projectUsersError={projectUsersError}
          chatRooms={chatRooms}
          projectUsers={projectUsers}
          activeRoom={activeRoom}
          searchTerm={searchTerm}
          handleContactClick={handleContactClick}
          startDirectChat={startDirectChat}
          setActiveChatRoom={setActiveChatRoom}          onVoiceCallClick={onVoiceCallClick}
          onVideoCallClick={onVideoCallClick}
          onRefreshProjectUsers={onRefreshProjectUsers}
        />
      </div>
      
      {/* Floating Add Chat Button */}
      <div className={styles.sidebarFooter}>
        <button
          className={styles.addChatButton}
          onClick={() => setShowNewChatModal(true)}
          title="Tạo cuộc trò chuyện mới"
        >
          <FiPlus size={24} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
