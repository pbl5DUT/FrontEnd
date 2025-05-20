import React, { useState, useEffect } from 'react';
import styles from './ChatRoomModular.module.css';
import { useAuth } from '@/modules/auth/contexts/auth_context';
import { useChatService } from '../services';
import useProjectUsers from '../services/useProjectUsers';

// Component imports
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import ParticipantsPanel from './ParticipantsPanel';
import CreateChatModal from './CreateChatModal';
import { Contact, ChatRoom } from './types';
import { adaptServiceChatRoom } from './adapters';

const ChatRoomModular: React.FC = () => {
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

  // Component state
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [showParticipants, setShowParticipants] = useState<boolean>(false);

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
  }, [activeRoom?.id]);

  useEffect(() => {
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
      // Handle null avatar by converting it to undefined
      const avatar = activeRoom.isGroup ? undefined : 
        (activeRoom.participants[0]?.avatar === null ? undefined : activeRoom.participants[0]?.avatar);
      
      const contact: Contact = {
        id: activeRoom.id,
        name: activeRoom.name,
        avatar: avatar,
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

  // Add a periodic refresh mechanism to ensure messages are up to date
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

  // Event handlers
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
      tempId,
      isOptimistic: true
    };
    
    // Thêm tin nhắn tạm thời vào UI ngay lập tức
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);
  
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

  return (
    <div className={styles.chatContainer}>
      {/* Sidebar Component */}      <Sidebar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loading={loading}
        error={error}
        chatRooms={chatRooms.map(room => adaptServiceChatRoom(room))}
        projectUsers={projectUsers}
        loadingProjectUsers={loadingProjectUsers}
        projectUsersError={projectUsersError}
        activeRoom={activeRoom ? adaptServiceChatRoom(activeRoom) : null}
        setActiveChatRoom={(room) => setActiveChatRoom(room as any)}
        startDirectChat={startDirectChat}
        setShowNewChatModal={setShowNewChatModal}
        handleContactClick={handleContactClick}
      />

      {/* Chat Area Component */}      <ChatArea
        activeRoom={activeRoom ? adaptServiceChatRoom(activeRoom) : null}
        activeContact={activeContact}
        messages={messages}
        userId={userId}
        showParticipants={showParticipants}
        setShowParticipants={setShowParticipants}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleAttachmentUpload={handleAttachmentUpload}
        setTypingStatus={setTypingStatus}
      />

      {/* Participants Panel Component */}      <ParticipantsPanel
        activeRoom={activeRoom ? adaptServiceChatRoom(activeRoom) : null}
        showParticipants={showParticipants}
        setShowParticipants={setShowParticipants}
        userId={userId}
      />

      {/* Create Chat Modal Component */}
      <CreateChatModal
        showNewChatModal={showNewChatModal}
        setShowNewChatModal={setShowNewChatModal}
        newChatName={newChatName}
        setNewChatName={setNewChatName}
        selectedParticipants={selectedParticipants}
        setSelectedParticipants={setSelectedParticipants}
        contacts={contacts}
        handleCreateChatRoom={handleCreateChatRoom}
        handleParticipantToggle={handleParticipantToggle}
      />
    </div>
  );
};

export default ChatRoomModular;
