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
} from 'react-icons/fi';

// Mock data cho cuộc trò chuyện
const mockContacts = [
  {
    id: 1,
    name: 'adm',
    avatar: null,
    isOnline: false,
    lastSeen: '10 phút trước',
    unread: 0,
    isActive: true,
  },
  {
    id: 2,
    name: 'anh.ha.due.2505',
    avatar: '/assets/avatar1.jpg',
    isOnline: true,
    lastSeen: 'Trực tuyến',
    unread: 2,
    isActive: false,
  },
  {
    id: 3,
    name: 'chau.vo.due.2505',
    avatar: '/assets/avatar2.jpg',
    isOnline: true,
    lastSeen: 'Trực tuyến',
    unread: 0,
    isActive: false,
  },
  {
    id: 4,
    name: 'cuong.do.due.2501',
    avatar: '/assets/avatar3.jpg',
    isOnline: false,
    lastSeen: '30 phút trước',
    unread: 0,
    isActive: false,
  },
  {
    id: 5,
    name: 'cuong.ngo.due.2505',
    avatar: '/assets/avatar4.jpg',
    isOnline: false,
    lastSeen: '1 giờ trước',
    unread: 5,
    isActive: false,
  },
];

// Mock data tin nhắn
const mockMessages = [
  {
    id: 1,
    senderId: 1,
    text: 'Xin chào, bạn có thể giúp tôi về dự án không?',
    timestamp: '09:15',
    status: 'read',
  },
  {
    id: 2,
    senderId: 2,
    text: 'Chào bạn, tôi có thể giúp gì cho bạn?',
    timestamp: '09:16',
    status: 'read',
  },
  {
    id: 3,
    senderId: 1,
    text: 'Tôi cần thông tin về tiến độ dự án CRM hiện tại',
    timestamp: '09:17',
    status: 'read',
  },
  {
    id: 4,
    senderId: 2,
    text: 'Hiện tại dự án đã hoàn thành khoảng 60%. Chúng tôi đang gặp một số vấn đề về API nhưng sẽ giải quyết trong tuần này.',
    timestamp: '09:20',
    status: 'read',
  },
  {
    id: 5,
    senderId: 2,
    text: 'Bạn có cần thêm thông tin gì không?',
    timestamp: '09:21',
    status: 'read',
  },
  {
    id: 6,
    senderId: 1,
    text: 'Không, cảm ơn bạn. Tôi sẽ chờ báo cáo tiếp theo.',
    timestamp: '09:25',
    status: 'sent',
  },
];

const ChatRoom: React.FC = () => {
  const [activeContact, setActiveContact] = useState(mockContacts[0]);
  const [contacts, setContacts] = useState(mockContacts);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactClick = (contact: (typeof mockContacts)[0]) => {
    setActiveContact(contact);

    // Update contacts to mark selected contact as active and reset unread
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

    if (newMessage.trim() === '') return;

    const newMsg = {
      id: messages.length + 1,
      senderId: 1, // Assuming current user has ID 1
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'sent',
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
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
          {filteredContacts.map((contact) => (
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
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {/* Chat Header */}
        <div className={styles.chatHeader}>
          <div className={styles.chatContact}>
            <div className={styles.contactAvatar}>
              {activeContact.avatar ? (
                <img src={activeContact.avatar} alt={activeContact.name} />
              ) : (
                <div className={styles.defaultAvatar}>
                  {activeContact.name.charAt(0).toUpperCase()}
                </div>
              )}
              {activeContact.isOnline && (
                <span className={styles.onlineIndicator}></span>
              )}
            </div>
            <div className={styles.contactInfo}>
              <div className={styles.contactName}>{activeContact.name}</div>
              <div className={styles.lastSeen}>{activeContact.lastSeen}</div>
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
                  message.senderId === 1 ? styles.outgoing : styles.incoming
                }`}
              >
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>{message.text}</div>
                  <div className={styles.messageTime}>
                    {message.timestamp}
                    {message.senderId === 1 && (
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
                  <button className={styles.attachOption}>
                    <FiImage />
                    <span>Hình ảnh</span>
                  </button>
                  <button className={styles.attachOption}>
                    <FiFile />
                    <span>Tài liệu</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className={styles.messageForm}>
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className={styles.messageInput}
            />
            <button type="submit" className={styles.sendButton}>
              <FiSend />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
