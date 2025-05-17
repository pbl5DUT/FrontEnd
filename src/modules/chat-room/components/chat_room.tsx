import React, { useState, useRef, useEffect } from 'react';
import styles from './chat_room.module.css';
import {
  FiSearch,
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiPaperclip,
  FiSend,
  FiSmile,
  FiImage,
  FiFile,
  FiPlus,
  FiUsers,
  FiX,
  FiMessageCircle,
} from 'react-icons/fi';
import { useChatService } from '../services';
import useProjectUsers from '../services/useProjectUsers';
import { useAuth } from '@/modules/auth/contexts/auth_context';

const ChatRoom: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.user_id || 0;
  const {
    contacts: apiContacts,
    chatRooms,
    messages: apiMessages,
    loading,
    error,
    activeRoom,
    sendMessage,
    createChatRoom,
    uploadAttachment,
    setActiveChatRoom,
    setTypingStatus,
    loadMessages,
    startDirectChat
  } = useChatService(userId);
  
  // Lấy danh sách người dùng trong các dự án
  const { 
    projectUsers,
    loading: loadingProjectUsers,
    error: projectUsersError
  } = useProjectUsers(userId);

  // Map API data to component state
  const [activeContact, setActiveContact] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [showParticipants, setShowParticipants] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  // Update local state when API data changes
  useEffect(() => {
    if (apiContacts && apiContacts.length > 0) {
      setContacts(apiContacts);
    }
  }, [apiContacts]);
    // Xóa tin nhắn cũ khi thay đổi phòng - sử dụng activeRoom?.id thay vì toàn bộ activeRoom
  // để tránh re-render không cần thiết khi các thuộc tính khác của phòng thay đổi
  useEffect(() => {
    if (activeRoom?.id) {
      // Đặt messages thành mảng rỗng ngay khi id phòng thay đổi 
      // trước khi loadMessages được gọi để tránh hiển thị tin nhắn từ phòng cũ
      setMessages([]);
    }
  }, [activeRoom?.id]);useEffect(() => {
    // Cải tiến xử lý cập nhật tin nhắn từ API chỉ khi có phòng hiện tại
    if (apiMessages && apiMessages.length > 0 && activeRoom) {
      setMessages(prevMessages => {
        // Luôn sử dụng danh sách tin nhắn từ API khi phòng mới được chọn (prevMessages rỗng)
        if (prevMessages.length === 0) {
          console.log('Hiển thị tin nhắn từ API cho phòng mới:', apiMessages.length);
          return apiMessages;
        }

        // Tạo một Map để tra cứu tin nhắn nhanh hơn theo nhiều tiêu chí
        const messageMap = new Map();
        prevMessages.forEach(msg => {
          // Lưu theo ID chính
          messageMap.set(msg.id, msg);
          
          // Lưu thêm theo tempId nếu có
          if (msg.tempId) {
            messageMap.set(`temp-${msg.tempId}`, msg);
          }
        });
        
        // Lọc tin nhắn API mới (chưa có trong danh sách hiện tại)
        const newMessages = apiMessages.filter(apiMsg => !messageMap.has(apiMsg.id));
        
        if (newMessages.length > 0) {
          console.log(`Cập nhật ${newMessages.length} tin nhắn mới từ API`);
          
          // Kết hợp tin nhắn hiện tại với tin nhắn mới và sắp xếp theo thời gian
          const updatedMessages = [...prevMessages, ...newMessages].sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeA - timeB;
          });
          
          return updatedMessages;
        }
        
        return prevMessages;
      });
    }
  }, [apiMessages, activeRoom]);

  useEffect(() => {
    if (activeRoom) {
      const contact = {
        id: activeRoom.id,
        name: activeRoom.name,
        avatar: activeRoom.isGroup ? null : activeRoom.participants[0]?.avatar,
        isOnline: activeRoom.isGroup ? false : activeRoom.participants[0]?.isOnline,
        lastSeen: activeRoom.isGroup 
          ? `${activeRoom.participants.length} participants` 
          : activeRoom.participants[0]?.lastSeen,
        unread: activeRoom.unreadCount,
        isActive: true,
      };
      setActiveContact(contact);
    }
  }, [activeRoom]);

  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add a periodic refresh mechanism to ensure messages are up to date
  // This helps prevent message synchronization issues
  useEffect(() => {
    if (!activeRoom || !loadMessages) return;
    
    console.log('Setting up message sync for room:', activeRoom.id);
    
    // Initial load of messages
    loadMessages(activeRoom.id);
    
    // Set up a periodic check for new messages
    const syncInterval = setInterval(() => {
      if (activeRoom) {
        console.log('Performing periodic message sync for room:', activeRoom.id);
        loadMessages(activeRoom.id);
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(syncInterval);
    };
  }, [activeRoom, loadMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleContactClick = (contact: any) => {
    // Find the corresponding chat room
    const room = chatRooms.find(r => r.id === contact.id);
    if (room) {
      setActiveChatRoom(room);
    }

    // Chỉ cập nhật activeContact mà không làm thay đổi danh sách contacts
    setActiveContact(contact);
  };
    const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!newMessage.trim() || !activeRoom) return;
  
  const message = newMessage;
  setNewMessage('');
  
  const tempId = Date.now().toString();  // Thêm tin nhắn optimistic vào danh sách tin nhắn hiện tại
  const optimisticMessage = {
    id: `temp-${tempId}`, // Tạo ID duy nhất cho tin nhắn optimistic
    senderId: userId.toString(),
    text: message,
    timestamp: new Date().toLocaleTimeString(),
    status: 'sent',
    tempId,
    isOptimistic: true // Đánh dấu đây là tin nhắn optimistic
  };
  
  // Thêm tin nhắn tạm thời vào UI ngay lập tức
  setMessages(prevMessages => [...prevMessages, optimisticMessage]);
  
  // Cuộn xuống dưới sau khi gửi tin nhắn
  setTimeout(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, 10);

  try {
    // Gửi tin nhắn qua API (không cần chờ đợi kết quả)
    sendMessage({
      roomId: activeRoom.id,
      text: message,
      receiverId: activeRoom.participants.find(p => p.id !== userId)?.id,
      tempId
    }).catch(err => console.error('Error in background message sending:', err));
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
  
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    if (!e.target.files || !e.target.files[0] || !activeRoom) return;
    
    const file = e.target.files[0];
    const receiverId = activeRoom.isGroup 
      ? undefined 
      : activeRoom.participants.find(p => p.id !== userId)?.id;
    
    // Ensure roomId is a number
    const roomIdNumber = typeof activeRoom.id === 'string' 
      ? parseInt(activeRoom.id.replace(/\D/g, ''), 10)
      : activeRoom.id;
      
    uploadAttachment({
      roomId: roomIdNumber,
      file: file,
      receiverId: receiverId ? Number(receiverId) : undefined
    });
    setShowAttachMenu(false);
  };
  const handleCreateChatRoom = async () => {
    if (newChatName.trim() === '') {
      alert('Please enter a chat room name');
      return;
    }
    
    if (selectedParticipants.length === 0) {
      alert('Please select at least one participant');
      return;
    }
    
    try {
      // Create new chat room
      const newRoom = await createChatRoom({
        name: newChatName,
        participantIds: selectedParticipants
      });
      
      // Close modal before updating active room to avoid unnecessary rendering
      setShowNewChatModal(false);
      setNewChatName('');
      setSelectedParticipants([]);
      
      // Set the new room as active after modal closes
      setTimeout(() => {
        if (newRoom && newRoom.id) {
          console.log('Setting new room as active:', newRoom);
          setActiveChatRoom(newRoom);
        } else {
          console.error('Invalid new room object:', newRoom);
          alert('Created chat room but received invalid data. Please refresh.');
        }
      }, 100); // Increased timeout to ensure modal fully closes
    } catch (error) {
      console.error('Failed to create chat room:', error);
      alert('Failed to create chat room. Please try again.');
    }
  };
  
  const handleParticipantToggle = (userId: number) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
    }
  };

  const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setTypingStatus(e.target.value.length > 0);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className={styles.chatContainer}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng, nhóm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabButton} ${
              activeTab === 'recent' ? styles.activeTab : ''
            }`}
            onClick={() => setActiveTab('recent')}
          >
            Mới nhất
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === 'users' ? styles.activeTab : ''
            }`}
            onClick={() => setActiveTab('users')}
          >
            Người dùng
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === 'groups' ? styles.activeTab : ''
            }`}
            onClick={() => setActiveTab('groups')}
          >
            Nhóm
          </button>
        </div>

        <div className={styles.contactsList}>
          {loading ? (
            <div className={styles.loading}>Đang tải...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : activeTab === 'recent' ? (
            chatRooms
              .filter(room => room.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((room) => (
                <div
                  key={room.id}
                  className={`${styles.contactItem} ${
                    room.id === activeRoom?.id ? styles.activeContact : ''
                  }`}
                  onClick={() => handleContactClick(room)}
                >
                  <div className={styles.contactAvatar}>
                    {room.isGroup ? (
                      <div className={styles.groupAvatar}>
                        <FiUsers />
                      </div>
                    ) : (
                      <>
                        {room.participants[0]?.avatar ? (
                          <img src={room.participants[0].avatar} alt={room.name} />
                        ) : (
                          <div className={styles.defaultAvatar}>
                            {room.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {room.participants[0]?.isOnline && (
                          <span className={styles.onlineIndicator}></span>
                        )}
                      </>
                    )}
                  </div>
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
              ))          ) : activeTab === 'users' ? (
            loadingProjectUsers ? (
              <div className={styles.loading}>Đang tải danh sách người dùng dự án...</div>
            ) : projectUsersError ? (
              <div className={styles.error}>{projectUsersError}</div>
            ) : projectUsers.length === 0 ? (
              <div className={styles.noResults}>Không có người dùng nào trong dự án của bạn</div>
            ) : (
              projectUsers
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
                    >
                      <div className={styles.contactAvatar}>
                        {projectUser.avatar ? (
                          <img src={projectUser.avatar} alt={projectUser.name} />
                        ) : (
                          <div className={styles.defaultAvatar}>
                            {projectUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {projectUser.isOnline && (
                          <span className={styles.onlineIndicator}></span>
                        )}
                      </div>                      <div className={styles.contactInfo}>
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
                })
            )
          ) : (
            chatRooms
              .filter(room => room.isGroup)
              .filter(room => room.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((room) => (
                <div
                  key={room.id}
                  className={`${styles.contactItem} ${
                    room.id === activeRoom?.id ? styles.activeContact : ''
                  }`}
                  onClick={() => handleContactClick(room)}
                >
                  <div className={styles.contactAvatar}>
                    <div className={styles.groupAvatar}>
                      <FiUsers />
                    </div>
                  </div>
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
              ))
          )}
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

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {/* Chat Header */}
        <div className={styles.chatHeader}>
          <div className={styles.chatContact}>
            <div className={styles.contactAvatar}>
              {activeContact?.avatar ? (
                <img src={activeContact.avatar} alt={activeContact.name} />
              ) : (
                <div className={styles.defaultAvatar}>
                  {activeContact?.name.charAt(0).toUpperCase()}
                </div>
              )}
              {activeContact?.isOnline && (
                <span className={styles.onlineIndicator}></span>
              )}
            </div>
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
            </button>            <button className={styles.actionButton}>
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
        </div>        {/* Chat Messages */}
        <div className={styles.messagesContainer}>
          <div className={styles.messagesList}>
            {messages.length === 0 && (
              <div className={styles.emptyMessages}>No messages yet. Start the conversation!</div>            )}            {messages.map((message, index) => {
              // Tạo key duy nhất dựa trên id và index
              const uniqueKey = message.isOptimistic ? `optimistic-${message.id}-${index}` : `message-${message.id}-${index}`;
              return (
                <div
                  key={uniqueKey}
                  className={`${styles.messageItem} ${
                    message.senderId === userId.toString() ? styles.outgoing : styles.incoming
                  }`}
                >
                  <div className={styles.messageContent}>
                    <div className={styles.messageText}>{message.text}</div>
                    <div className={styles.messageTime}>
                      {message.timestamp}
                      {message.senderId === userId.toString() && (
                        <span className={styles.messageStatus}>
                          {message.status === 'sent' ? '✓' : '✓✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className={styles.inputContainer}>
          <div className={styles.inputActions}>
            <button
              className={styles.actionButton}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <FiSmile />
            </button>
            <div className={styles.attachButtonContainer}>
              <button
                className={styles.actionButton}
                onClick={() => setShowAttachMenu(!showAttachMenu)}
              >
                <FiPaperclip />
              </button>
              {showAttachMenu && (
                <div className={styles.attachMenu}>
                  <label className={styles.attachOption}>
                    <FiImage />
                    <span>Hình ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleAttachmentUpload(e, 'image')}
                    />
                  </label>
                  <label className={styles.attachOption}>
                    <FiFile />
                    <span>Tài liệu</span>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => handleAttachmentUpload(e, 'document')}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className={styles.messageForm}>
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChange={handleNewMessageChange}
              className={styles.messageInput}
            />
            <button type="submit" className={styles.sendButton}>
              <FiSend />
            </button>
          </form>
        </div>
      </div>

      {/* Participants Panel */}
      {activeRoom && (
        <div className={`${styles.participantsPanel} ${!showParticipants && styles.participantsPanelHidden}`}>
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
          </div>        <div className={styles.participantsList}>
            {activeRoom?.participants.map((user, index) => {
              // Kiểm tra xem người dùng có phải là chủ phòng không
              const isRoomOwner = activeRoom.senderId && String(user.id) === String(activeRoom.senderId);
              const isCurrentUser = String(user.id) === String(userId);
              
              return (
                <div key={`participant-${user.id || index}`} className={styles.participantItem}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name || 'User'} className={styles.participantAvatar} />
                  ) : (
                    <div className={styles.participantAvatar}>
                      {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                    </div>
                  )}
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
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Tạo trò chuyện mới</h2>
              <button 
                className={styles.closeButton} 
                onClick={() => setShowNewChatModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>Tên nhóm</label>
                <input
                  type="text"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="Nhập tên nhóm trò chuyện"
                  className={styles.modalInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Người tham gia</label>
                {selectedParticipants.length > 0 && (
                  <div className={styles.selectedParticipants}>
                    {selectedParticipants.map((participantId) => {
                      const participant = contacts.find(c => c.id === participantId);
                      return (
                        <div className={styles.participantTag} key={participantId}>
                          <span className={styles.participantName}>{participant?.name}</span>
                          <button 
                            className={styles.removeParticipant}
                            onClick={() => handleParticipantToggle(participantId)}
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className={styles.participantsList}>
                  {contacts.map((contact) => (
                    <div 
                      key={contact.id}
                      className={styles.participantItem}
                    >
                      <input
                        type="checkbox"
                        id={`contact-${contact.id}`}
                        checked={selectedParticipants.includes(contact.id)}
                        onChange={() => handleParticipantToggle(contact.id)}
                      />
                      <label htmlFor={`contact-${contact.id}`}>
                        <div className={styles.smallAvatar}>
                          {contact.avatar ? (
                            <img src={contact.avatar} alt={contact.name} />
                          ) : (
                            contact.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {contact.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowNewChatModal(false)}
              >
                Hủy
              </button>
              <button
                className={styles.createButton}
                onClick={handleCreateChatRoom}
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
