import React, { useState, useEffect, useCallback } from 'react';
import styles from './ChatRoomModular.module.css';
import { useAuth } from '@/modules/auth/contexts/auth_context';
import { useChatService } from '../services';
import useProjectUsers from '../services/useProjectUsers';
import { useProjectMembers } from '../hooks/useProjectMembers';
import useAllUsers from '../hooks/useAllUsers';

// Component imports
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import ParticipantsPanel from './ParticipantsPanel';
import CreateChatModal from './CreateChatModal';
import { Contact, ChatRoom } from './types';
import { adaptServiceChatRoom } from './adapters';

const ChatRoomModular: React.FC = () => {  const { user } = useAuth();
  const userId = user?.user_id || '';
  const userIdNumber = String(userId).replace('user-', '') || "0";
  
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
    startDirectChat,
    websocket
  } = useChatService(userIdNumber);
    // Lấy danh sách người dùng trong các dự án
  const { 
    projectUsers,
    loading: loadingProjectUsers,
    error: projectUsersError
  } = useProjectUsers(String(userId));
    // Lấy danh sách thành viên trong các project của người dùng
  const {
    members: projectMembers,
    loading: loadingProjectMembers,
    error: projectMembersError
  } = useProjectMembers(String(userId));
  
  // Lấy danh sách tất cả người dùng trong hệ thống
  const {
    users: allUsers,
    loading: loadingAllUsers,
    error: allUsersError,
    refresh: refreshAllUsers
  } = useAllUsers();
  // Hàm kiểm tra và làm sạch dữ liệu phòng chat
  const validateParticipantsInRoom = (room: ChatRoom): ChatRoom => {
    if (!room) return room;
    
    // Đảm bảo participants là một mảng hợp lệ
    if (!Array.isArray(room.participants)) {
      console.error('Room participants is not an array:', room);
      room.participants = [];
      return room;
    }
    
    
    // Lọc bỏ các phần tử null/undefined và làm sạch dữ liệu
    const validatedParticipants = room.participants
      .filter(participant => participant !== null && participant !== undefined)
      .map(participant => {
        // Check if participant has a nested user object which is the actual user data
        const userData = participant.user || participant;
        
        return {
          // Preserve original ID instead of generating a new one
          id: userData.user_id || userData.id || participant.user_id || participant.id || '',
          // Try to get the full name from various possible paths
          name: userData.full_name || userData.name || participant.full_name || participant.name || 'Người dùng không xác định',
          avatar: userData.avatar || participant.avatar || null,
          isOnline: !!(userData.is_online || userData.isOnline || participant.is_online || participant.isOnline),
          lastSeen: userData.last_seen || userData.lastSeen || participant.last_seen || participant.lastSeen || ''
        };
      });
    
    return {
      ...room,
      participants: validatedParticipants
    };
  };
  
  // Component state
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('recent');  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);  
  const [showParticipants, setShowParticipants] = useState<boolean>(false);
  
  
  // Danh sách người dùng để hiển thị tùy theo quyền admin
  const [availableContacts, setAvailableContacts] = useState<any[]>([]);
  
  // Reset modal state when closing
  useEffect(() => {
    if (!showNewChatModal) {
      setNewChatName('');
      setSelectedParticipants([]);
    }
  }, [showNewChatModal]);
  const [incomingCall, setIncomingCall] = useState<{
    callerId?: string | number; // Chấp nhận cả ID dạng chuỗi và số
    isAudioOnly: boolean;
    offer?: RTCSessionDescriptionInit;
  } | null>(null);// Send WebSocket signal messages for WebRTC
  const sendSignalMessage = useCallback((message: any) => {
    if (!activeRoom) return;
    
    // Make sure we send a numeric room ID to avoid format issues
    // Extract just the numeric part of the room ID to ensure consistency
    const numericRoomId = String(activeRoom.id).replace(/[^0-9]/g, '');
    
    // Giữ nguyên định dạng userId thay vì chuyển đổi thành số
    // Vì định dạng có thể là "user-1", "user-2", ...
    const userIdString = String(userId);
    
    // Format the message to match what the backend expects
    const websocketMessage = {
      ...message,
      roomId: numericRoomId,
      chatroom_id: numericRoomId,
      user_id: userIdString,  // Giữ nguyên định dạng chuỗi
      userId: userIdString    // Giữ nguyên định dạng chuỗi
    };
    
    console.log('Sending WebRTC signal:', websocketMessage);
    
    // We're using the existing WebSocket connection from useChatService
    if (websocket && websocket.sendMessage) {
      const success = websocket.sendMessage(websocketMessage);
      console.log(`WebRTC signal sent successfully: ${success}`);
    } else {
      console.error('WebSocket not available for sending signals');
    }
  }, [activeRoom, websocket, userId]);  // Update local state when API data changes
  useEffect(() => {
    if (apiContacts && apiContacts.length > 0) {
      setContacts(apiContacts);
    }
  }, [apiContacts]);
  
  // Ensure active room data updates properly when room changes
  useEffect(() => {
    if (activeRoom) {
      
      // Force refresh the active room data if there are problems with participants
      if (!Array.isArray(activeRoom.participants) || activeRoom.participants.length === 0) {
        console.warn('Active room has no participants or invalid participants array, attempting to refresh');
        
        // Trigger a refresh of the room's data if needed
        const roomId = activeRoom.id;
        if (roomId) {
          loadMessages(roomId.toString()).catch(err => 
            console.error('Error refreshing room messages:', err)
          );
        }
      }
    }
  }, [activeRoom, loadMessages]);    // Cập nhật danh sách người dùng có thể tạo nhóm chat - hiển thị tất cả người dùng
  useEffect(() => {
    // Kiểm tra xem có dữ liệu người dùng từ API không
    if (allUsers && allUsers.length > 0) {
      // Chuyển đổi định dạng từ API sang cấu trúc contact
      const formattedUsers = allUsers.map(user => ({
        id: user.user_id,
        name: user.full_name || user.email?.split('@')[0] || 'Người dùng',
        avatar: user.avatar,
        isOnline: user.isOnline || false,
        email: user.email,
      })).filter(user => user.id !== userId); // Lọc bản thân ra khỏi danh sách
      
      setAvailableContacts(formattedUsers);
      console.log('Đã tải tất cả người dùng cho chat:', formattedUsers.length);
    } else if (contacts && contacts.length > 0) {
      // Dùng contacts từ API chatroom nếu không có dữ liệu từ API users
      setAvailableContacts(contacts);
      console.log('Sử dụng danh sách contacts thay thế:', contacts.length);
    } else {
      // Nếu không có dữ liệu từ cả hai nguồn, hiển thị danh sách trống
      setAvailableContacts([]);
      console.warn('Không có dữ liệu người dùng để hiển thị');
    }
  }, [allUsers, contacts, userId]);// Listen for WebRTC signals from WebSocket
  useEffect(() => {
    // Function to handle WebRTC signal events
    const handleWebRTCSignal = (event: CustomEvent) => {
      const data = event.detail;
      console.log('WebRTC signal received:', data);
      
      // Treat both roomId and chatroom_id, since the backend might use either
      const signalRoomId = data.roomId || data.chatroom_id;
      const currentRoomId = activeRoom?.id;
      
      
      // Only handle signals for the current room - more flexible comparison
      // Convert both to strings for comparison to handle number/string inconsistencies
      const normalizedSignalRoomId = String(signalRoomId).replace(/[^0-9]/g, '');
      const normalizedCurrentRoomId = String(currentRoomId).replace(/[^0-9]/g, '');
      
      if (!normalizedCurrentRoomId || !normalizedSignalRoomId || normalizedSignalRoomId !== normalizedCurrentRoomId) {
        console.log('Ignoring signal - room ID mismatch');
        return;
      }
        // Don't handle your own signals
      const senderUserId = String(data.userId || data.user_id || '').trim();
      const currentUserId = String(userId || '').trim();
      
      // Log the sanitized IDs for debugging
      console.log(`Comparing signal sender ID "${senderUserId}" with current user ID "${currentUserId}"`);
      
      if (senderUserId && currentUserId && senderUserId === currentUserId) {
        console.log('Ignoring own signal');
        return;
      }
        if (data.type === 'call_offer') {
        console.log('Received call offer, showing notification');
        // Handle incoming call offer
        setIncomingCall({
          callerId: data.userId || data.user_id,  // Giữ nguyên định dạng của ID
          isAudioOnly: !!data.isAudioOnly,
          offer: data.sdp
        });
      } else if (data.type === 'call_end') {
        // Handle call end
        console.log('Received call end signal');
        setIncomingCall(null);
      } else if (data.type === 'ice_candidate' || data.type === 'call_answer') {
        console.log(`Received ${data.type} from ${data.userId || data.user_id}, re-dispatching to CallModal`);
        
        // Ensure important fields are set for both call_answer and ice_candidate
        if (data.type === 'ice_candidate' && !data.candidate) {
          console.error('Received ice_candidate without candidate data, cannot forward');
          return;
        }
        
        if (data.type === 'call_answer' && !data.sdp) {
          console.error('Received call_answer without SDP data, cannot forward');
          return;
        }
        
        // Re-dispatch the event to be handled by CallModal
        const newEvent = new CustomEvent('webrtc_signal', { detail: data });
        window.dispatchEvent(newEvent);
      }
    };

    // Add event listener
    window.addEventListener('webrtc_signal', handleWebRTCSignal as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('webrtc_signal', handleWebRTCSignal as EventListener);
    };
  }, [activeRoom, userId]);

  // Reset incoming calls and messages when changing rooms
  useEffect(() => {
    if (activeRoom?.id) {
      // Clear messages and reset any incoming call notification
      setMessages([]);
      setIncomingCall(null);
      console.log('Changed room, reset messages and call status');
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
    // const optimisticMessage = {
    //   id: `temp-${tempId}`,
    //   senderId: userId.toString(),
    //   text: message,
    //   timestamp: new Date().toLocaleTimeString(),
    //   status: 'sent',
    //   tempId,
    //   isOptimistic: true
    // };
    
    // Thêm tin nhắn tạm thời vào UI ngay lập tức
    // setMessages(prevMessages => [...prevMessages, optimisticMessage]);
    try {
      // Find the receiver ID and convert it to a number if it's a string
      const receiverParticipant = activeRoom.participants.find(p => p.id !== userId);
      let receiverId: number | undefined = undefined;
      
      if (receiverParticipant?.id) {
        // Convert to number if it's a string
        receiverId = typeof receiverParticipant.id === 'string' 
          ? parseInt(receiverParticipant.id.replace(/\D/g, '') || '0', 10) || undefined
          : receiverParticipant.id as number;
      }
      
      // Gửi tin nhắn qua API (không cần chờ đợi kết quả)
      sendMessage({
        roomId: activeRoom.id,
        text: message,
        receiverId: receiverId,
        tempId
      }).catch(err => console.error('Error in background message sending:', err));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
    const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    if (!e.target.files || !e.target.files[0] || !activeRoom) return;
    
    const file = e.target.files[0];
    
    // Find receiver and convert ID to number properly
    let receiverId: number | undefined = undefined;
    if (!activeRoom.isGroup) {
      const receiverParticipant = activeRoom.participants.find(p => p.id !== userId);
      if (receiverParticipant?.id) {
        // Use a more robust conversion that handles different ID formats
        if (typeof receiverParticipant.id === 'string') {
          // For IDs like 'user-123', extract only the numeric part
          const numericPart = receiverParticipant.id.replace(/\D/g, '');
          receiverId = numericPart ? parseInt(numericPart, 10) : undefined;
        } else {
          receiverId = receiverParticipant.id as number;
        }
      }
    }
    
    // Use the full original room ID without modification
    uploadAttachment({
      roomId: activeRoom.id,
      file: file,
      receiverId: receiverId
    });
  };

  // Chuyển đổi ID người dùng dạng chuỗi thành số
  const convertUserIdsToNumber = (userIds: string[]): number[] => {
    return userIds.map(id => {
      // Nếu ID có dạng user-X, trích xuất số X
      if (id.startsWith('user-')) {
        return parseInt(id.replace('user-', ''), 10);
      }
      // Nếu ID đã là số hoặc có thể chuyển thành số
      return parseInt(id, 10) || 0;
    }).filter(id => id > 0); // Lọc các giá trị không hợp lệ
  };
  const handleCreateChatRoom = async () => {
    if (newChatName.trim() === '') {
      alert('Vui lòng nhập tên nhóm trò chuyện');
      return;
    }
    
    if (selectedParticipants.length === 0) {
      alert('Vui lòng chọn ít nhất một người tham gia');
      return;
    }
    
    try {
      console.log('Creating chat room with participants:', selectedParticipants);
      
      // Cho phép sử dụng trực tiếp ID dạng chuỗi (user-1, user-2...)
      // hoặc chuyển đổi thành số nếu cần
      const processedParticipantIds = selectedParticipants.map(id => {
        console.log('Processing participant ID:', id);
        return id; // Giữ nguyên ID dạng chuỗi
      });
      
      // Create new chat room
      const newRoom = await createChatRoom({
        name: newChatName,
        participantIds: processedParticipantIds
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
  };  const handleParticipantToggle = (userId: string) => {
    // Cho phép tất cả người dùng tham gia cuộc trò chuyện, không phân biệt có trong project hay không
    console.log('Toggle participant:', userId);
    
    setSelectedParticipants(prev => {
      // Kiểm tra xem userId đã có trong mảng chưa
      const exists = prev.includes(userId);
      
      // Nếu đã có thì xóa khỏi mảng
      if (exists) {
        console.log('Removing participant:', userId);
        return prev.filter(id => id !== userId);
      }
      
      // Nếu chưa có thì thêm vào mảng
      console.log('Adding participant:', userId);
      return [...prev, userId];
    });
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
        projectUsers={allUsers.map(user => ({
          id: user.user_id,
          name: user.full_name || user.email?.split('@')[0] || 'Người dùng',
          avatar: user.avatar || undefined,
          isOnline: user.isOnline || false,
          email: user.email
        }))}
        loadingProjectUsers={loadingAllUsers}
        projectUsersError={allUsersError}
        onRefreshProjectUsers={refreshAllUsers}
        activeRoom={activeRoom ? adaptServiceChatRoom(activeRoom) : null}
        setActiveChatRoom={(room) => setActiveChatRoom(room as any)}
        startDirectChat={startDirectChat}
        setShowNewChatModal={setShowNewChatModal}
        handleContactClick={handleContactClick}
      />      {/* Chat Area Component */}      <ChatArea
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
        sendSignalMessage={sendSignalMessage}
        incomingCall={incomingCall}
        setIncomingCall={setIncomingCall}
      />

      {/* Participants Panel Component */}      <ParticipantsPanel
        activeRoom={activeRoom ? validateParticipantsInRoom(adaptServiceChatRoom(activeRoom)) : null}
        showParticipants={showParticipants}
        setShowParticipants={setShowParticipants}
        userId={userId}
      />{/* Create Chat Modal Component */}      <CreateChatModal
        showNewChatModal={showNewChatModal}
        setShowNewChatModal={setShowNewChatModal}
        newChatName={newChatName}
        setNewChatName={setNewChatName}
        selectedParticipants={selectedParticipants}
        setSelectedParticipants={setSelectedParticipants}
        contacts={availableContacts}
        handleCreateChatRoom={handleCreateChatRoom}
        handleParticipantToggle={handleParticipantToggle}
        loadingMembers={loadingAllUsers}
      />
    </div>
  );
};

export default ChatRoomModular;
