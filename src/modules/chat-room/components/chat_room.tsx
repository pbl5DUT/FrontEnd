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
} from 'react-icons/fi';
import { useChatService } from '../services';
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
    loadMessages
  } = useChatService(userId);

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
  const [newChatName, setNewChatName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);

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
    // Xử lý cập nhật tin nhắn từ API chỉ khi có phòng hiện tại
    if (apiMessages && apiMessages.length > 0 && activeRoom) {
      setMessages(prevMessages => {
        // Luôn sử dụng danh sách tin nhắn từ API khi phòng mới được chọn (prevMessages rỗng)
        if (prevMessages.length === 0) {
          console.log('Hiển thị tin nhắn từ API cho phòng mới:', apiMessages.length);
          return apiMessages;
        }
        
        // Kiểm tra các tin nhắn mới từ API mà chưa có trong danh sách hiện tại
        const currentMessageIds = new Set(prevMessages.map(msg => msg.id));
        const newApiMessages = apiMessages.filter(msg => !currentMessageIds.has(msg.id));
        
        if (newApiMessages.length > 0) {
          console.log(`Thêm ${newApiMessages.length} tin nhắn mới từ API`);
          return [...prevMessages, ...newApiMessages];
        }
        
        // Giữ nguyên danh sách hiện tại (có thể bao gồm các cập nhật optimistic)
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
  
  const tempId = Date.now().toString();
  // Thêm tin nhắn optimistic vào danh sách tin nhắn hiện tại
  const optimisticMessage = {
    id: `temp-${tempId}`,
    senderId: userId.toString(),
    text: message,
    timestamp: new Date().toLocaleTimeString(),
    status: 'sent',
    tempId
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
              ))
          ) : activeTab === 'users' ? (
            contacts
              .filter(contact => !contact.isGroup)
              .filter(contact => contact.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((contact) => (                <div
                  key={contact.id}
                  className={`${styles.contactItem} ${
                    contact.id === activeRoom?.id ? styles.activeContact : ''
                  }`}
                  onClick={() => handleContactClick(contact)}
                >
                  <div className={styles.contactAvatar}>
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} />
                    ) : (
                      <div className={styles.defaultAvatar}>
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {contact.isOnline && (
                      <span className={styles.onlineIndicator}></span>
                    )}
                  </div>
                  <div className={styles.contactInfo}>
                    <div className={styles.contactName}>{contact.name}</div>
                    <div className={styles.lastSeen}>{contact.lastSeen}</div>
                  </div>
                  {contact.unread > 0 && (
                    <div className={styles.unreadBadge}>{contact.unread}</div>
                  )}
                </div>
              ))
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
            </button>
            <button className={styles.actionButton}>
              <FiMoreVertical />
            </button>
          </div>
        </div>        {/* Chat Messages */}
        <div className={styles.messagesContainer}>
          <div className={styles.messagesList}>
            {messages.length === 0 && (
              <div className={styles.emptyMessages}>No messages yet. Start the conversation!</div>
            )}            {messages.map((message) => {
              return (
                <div
                  key={message.id}
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
