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
import { useChatService } from '../services/chat_service';
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
    setTypingStatus
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

  // Update local state when API data changes
  useEffect(() => {
    if (apiContacts && apiContacts.length > 0) {
      setContacts(apiContacts);
    }
  }, [apiContacts]);

  useEffect(() => {
    if (apiMessages && apiMessages.length > 0) {
      setMessages(apiMessages);
    }
  }, [apiMessages]);

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

    // Keep this for compatibility with existing code
    setActiveContact(contact);
    setContacts(
      contacts.map((c) =>
        c.id === contact.id
          ? { ...c, isActive: true, unread: 0 }
          : { ...c, isActive: false }
      )
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (newMessage.trim() === '' || !activeRoom) return;

    // Get the receiver id for direct messages
    const receiverId = activeRoom.isGroup 
      ? undefined 
      : activeRoom.participants.find(p => p.id !== userId)?.id;
      
    sendMessage(activeRoom.id, newMessage, receiverId);
    setNewMessage('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    if (!e.target.files || !e.target.files[0] || !activeRoom) return;
    
    const file = e.target.files[0];
    const receiverId = activeRoom.isGroup 
      ? undefined 
      : activeRoom.participants.find(p => p.id !== userId)?.id;
      
    uploadAttachment(activeRoom.id, file, receiverId);
    setShowAttachMenu(false);
  };
  
  const handleCreateChatRoom = async () => {
    if (newChatName.trim() === '') return;
    
    try {
      const newRoom = await createChatRoom(newChatName, selectedParticipants);
      setActiveChatRoom(newRoom);
      setShowNewChatModal(false);
      setNewChatName('');
      setSelectedParticipants([]);
    } catch (error) {
      console.error('Failed to create chat room:', error);
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

        <div className={styles.sidebarActions}>
          <button
            className={styles.newChatButton}
            onClick={() => setShowNewChatModal(true)}
          >
            <FiPlus /> Trò chuyện mới
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
              .map((contact) => (
                <div
                  key={contact.id}
                  className={`${styles.contactItem} ${
                    contact.isActive ? styles.activeContact : ''
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
        </div>

        {/* Chat Messages */}
        <div className={styles.messagesContainer}>
          <div className={styles.messagesList}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.messageItem} ${
                  message.senderId === userId ? styles.outgoing : styles.incoming
                }`}
              >
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>{message.text}</div>
                  <div className={styles.messageTime}>
                    {message.timestamp}
                    {message.senderId === userId && (
                      <span className={styles.messageStatus}>
                        {message.status === 'sent' ? '✓' : '✓✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
