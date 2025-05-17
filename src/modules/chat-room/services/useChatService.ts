import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ChatContact, ChatMessage, ChatRoom, ConnectionState, 
  CreateRoomParams, SendMessageParams, UploadAttachmentParams 
} from './types';
import { 
  createNewChatRoom, fetchChatRooms, 
  fetchMessages, sendMessageViaApi, 
  uploadFileAttachment 
} from './chatApi';
import { useWebSocket } from './useWebSocket';
import { formatMessageFromResponse } from './formatters';
import axios from '@/services/axiosInstance';

/**
 * Hook chính quản lý toàn bộ chức năng chat
 * @param userId User ID của người dùng hiện tại
 */
export const useChatService = (userId: number) => {
  // State
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  
  const isMountedRef = useRef(true);
  const isLoadingRef = useRef(false);
  // Cải tiến hàm normalizeRoomId để xử lý đồng nhất ID phòng chat
  const normalizeRoomId = useCallback((roomId: string | number | undefined | null) => {
    if (!roomId) return '';
    
    const stringId = String(roomId).trim();
    if (!stringId) return '';
    
    // Xử lý chuỗi ID để đảm bảo định dạng luôn thống nhất là chat-XXX
    let cleanId = stringId;
    
    // Bước 1: Loại bỏ tiền tố nếu có
    if (cleanId.startsWith('chat-')) {
      cleanId = cleanId.substring(5);
    } else if (cleanId.startsWith('chat_')) {
      cleanId = cleanId.substring(5);
    }
    
    // Bước 2: Đảm bảo ID sạch không còn các prefix
    cleanId = cleanId.trim();
    
    // Bước 3: Thêm tiền tố chuẩn
    return `chat-${cleanId}`;
  }, []);

  // Mark messages as read
  const markMessagesAsRead = useCallback((messageIds: string[]) => {
    if (!activeRoom) return;
    
    // Send message read status via WebSocket
    websocket.sendMessage({ 
      type: 'mark_read',
      message_ids: messageIds,
      user_id: userId
    });
    
    // Update locally
    setMessages(prev => 
      prev.map(msg => 
        messageIds.includes(msg.id) ? {...msg, status: 'read'} : msg
      )
    );
    
    // Update unread count
    setChatRooms(prev => 
      prev.map(room => 
        room.id === activeRoom.id ? {...room, unreadCount: 0} : room
      )
    );
  }, [activeRoom, userId]); 
  
  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    console.log('WebSocket message received:', data);
    // Xử lý typing indicator
  if (data.type === 'typing') {
    console.log('Typing indicator received:', data);
    const currentUserId = userId.toString();
    const senderUserId = data.user_id.toString();
    const isTyping = data.is_typing;
    const chatroomId = data.chatroom_id;
    
    // Chỉ xử lý nếu không phải là typing indicator của chính mình
    if (currentUserId !== senderUserId) {
      setChatRooms(prev => prev.map(room => {
        // Normalize the room IDs for comparison
        const normalizedRoomId = normalizeRoomId(room.id);
        const normalizedChatroomId = normalizeRoomId(chatroomId);
        
        if (normalizedRoomId === normalizedChatroomId) {
          console.log(`Setting typing indicator to ${isTyping} for room ${room.id}`);
          return { ...room, isTyping: isTyping };
        }
        return room;
      }));
    }
    return;
  }
  if (data.type === 'chat_message') {
    
    // Bỏ qua tin nhắn không hợp lệ hoặc không có ID
    if (!data.message || (!data.message.message_id && !data.message.id)) {
      console.log('Ignoring invalid WebSocket message data');
      return;
    }
    
    // Định dạng tin nhắn nhận được
    const newMessage = formatMessageFromResponse(data.message);
    console.log('Formatted message from WebSocket:', newMessage);
    
    // Xác định phòng chat từ tin nhắn
    let chatroomId = '';
    if (data.message && data.message.chatroom && typeof data.message.chatroom === 'object') {
      chatroomId = data.message.chatroom.chatroom_id;
    } else if (data.message && data.message.chatroom_id) {
      chatroomId = data.message.chatroom_id;
    } else if (data.chatroom_id) {
      chatroomId = data.chatroom_id;
    }
    
    // Cập nhật danh sách phòng chat
    setChatRooms(prevRooms => {
      return prevRooms.map(room => {
        const normalizedMessageRoomId = normalizeRoomId(chatroomId);
        const normalizedRoomId = normalizeRoomId(room.id);        if (normalizedRoomId === normalizedMessageRoomId) {
          console.log('Updating room with new message:', room.id);
          
          // Cập nhật số lượng tin nhắn chưa đọc
          // Chỉ tăng unreadCount nếu:
          // 1. Phòng này không phải phòng đang mở
          // 2. Người gửi tin nhắn không phải là người dùng hiện tại (không đếm tin nhắn của chính mình)
          const isCurrentUserSender = String(newMessage.senderId) === String(userId);
          const isActiveRoom = activeRoom?.id === room.id;
          
          // Chỉ tăng số tin nhắn chưa đọc khi không phải là tin nhắn của chính mình
          // và không phải là phòng đang hoạt động
          const newUnreadCount = isCurrentUserSender || isActiveRoom 
            ? room.unreadCount || 0  // Giữ nguyên số lượng
            : (room.unreadCount || 0) + 1; // Tăng thêm 1
          
          return {
            ...room,
            lastMessage: newMessage,
            unreadCount: newUnreadCount,
            isTyping: false
          };
        }
        return room;
      });
    });
    
    if (activeRoom) {
      const normalizedActiveRoomId = normalizeRoomId(activeRoom.id);
      const normalizedMsgRoomId = normalizeRoomId(chatroomId);
      
      // Nếu tin nhắn thuộc phòng chat đang mở, thêm vào danh sách tin nhắn
      if (normalizedMsgRoomId === normalizedActiveRoomId) {
        console.log('Tin nhắn thuộc phòng đang mở, thêm vào danh sách tin nhắn');
          setMessages(prevMessages => {
          // Kiểm tra xem tin nhắn đã tồn tại trong danh sách chưa (có thể là tin nhắn optimistic)
          const tempId = data.message.temp_id || newMessage.tempId;
          const existingIndex = prevMessages.findIndex(msg => 
            msg.id === newMessage.id || 
            (tempId && msg.tempId === tempId) ||
            (msg.id.startsWith('temp-') && tempId && msg.tempId === tempId)
          );
          
          if (existingIndex !== -1) {
            // Nếu tin nhắn đã tồn tại, thay thế phiên bản optimistic
            console.log('Thay thế tin nhắn optimistic bằng tin nhắn thực tế:', tempId);
            const updatedMessages = [...prevMessages];
            updatedMessages[existingIndex] = newMessage;
            return updatedMessages;
          } else {
            // Nếu tin nhắn chưa tồn tại, thêm vào danh sách
            console.log('Thêm tin nhắn mới vào danh sách tin nhắn:', newMessage.id);
            return [...prevMessages, newMessage];
          }
        });
        
        // Tự động đánh dấu đã đọc nếu là người nhận
        if (data.message.receiver_id === userId.toString()) {
          markMessagesAsRead([newMessage.id]);
        }
      }
    }
  } else if (data.type === 'messages_read') {
      // Update message status
      if (activeRoom) {
        setMessages(prevMessages => {
          return prevMessages.map(msg => {
            if (data.message_ids.includes(msg.id)) {
              return { ...msg, status: 'read' };
            }
            return msg;
          });
        });
      }
    }
  }, [activeRoom, userId, markMessagesAsRead, normalizeRoomId]);
  

  // Initialize WebSocket connection
  const websocket = useWebSocket({
    userId,
    activeRoom, 
    onMessage: handleWebSocketMessage,
    onError: setError,
    onConnectionStateChange: setConnectionState
  });
  // Load messages for a specific chat room
  const loadMessages = useCallback(async (roomId: string | number) => {
    try {
      setLoading(true);
      // Xóa tin nhắn cũ trước khi tải tin nhắn mới để tránh hiển thị tin nhắn của phòng cũ
      setMessages([]); 
      
      const { messages: formattedMessages, unreadMessageIds } = await fetchMessages(roomId);
      // Đặt tin nhắn mới
      setMessages(formattedMessages);
      setError(null);
      
      // Mark messages as read
      if (unreadMessageIds.length > 0) {
        markMessagesAsRead(unreadMessageIds);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  }, [userId, markMessagesAsRead]);  // Set active chat room
  const setActiveChatRoom = useCallback((room: ChatRoom) => {
    // Nếu phòng đã được chọn, không làm gì cả
    if (activeRoom && activeRoom.id === room.id) {
      return;
    }
    
    // Chỉ cập nhật state phòng đang active mà không thay đổi danh sách
    setActiveRoom(room);
    
    // Tải tin nhắn của phòng mới
    loadMessages(room.id);
    
    // Không cần cập nhật lại toàn bộ danh sách phòng chat
    // Việc hiển thị phòng nào là active sẽ được xử lý bởi component dựa trên activeRoom.id
  }, [activeRoom, loadMessages]);
    
    // Không cần theo dõi tin nhắn mới từ chatRooms nữa
    // Chúng ta dựa vào WebSocket để cập nhật tin nhắn thời gian thực
    // và xử lý từng phòng chat riêng biệt

    // Load all chat rooms
    const loadChatRooms = useCallback(async () => {
    if (!userId) return;
    
    // Check authentication
    const token = localStorage.getItem('access_token');
    if (!token) {
        setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
    }
    
    // Prevent concurrent loadChatRooms calls
    if (isLoadingRef.current) {
        console.log('Already loading chat rooms, skipping');
        return;
    }
    
    try {
        isLoadingRef.current = true;
        setLoading(true);
        console.log('Đang tải phòng chat cho người dùng:', userId);
        
        const { rooms, contacts } = await fetchChatRooms();
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
        setChatRooms(rooms);
        setContacts(contacts);
        setError(null);
        }
    } catch (err) {
        console.error('Lỗi khi tải phòng chat:', err);
        if (isMountedRef.current) {
        setError('Không thể tải dữ liệu phòng chat');
        }
    } finally {
        isLoadingRef.current = false;
        if (isMountedRef.current) {
        setLoading(false);
        }
    }
    }, [userId]);
  const sendMessage = useCallback(async ({ roomId, text, receiverId, tempId }: SendMessageParams) => {
    // Define tempId outside of try block to make it accessible in catch block
    const finalTempId = tempId || Date.now().toString();
    
    try {
      // Create optimistic message and add to messages state immediately
      const optimisticMessage: ChatMessage = {
        id: `temp-${finalTempId}`,
        senderId: userId.toString(),
        text: text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'sent',
        tempId: finalTempId
      };
      
      // Add optimistic message to UI immediately
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      
      // Update chat room with last message
      setChatRooms(prevRooms => {
        return prevRooms.map(room => {
          if (room.id === activeRoom?.id) {
            return {
              ...room,
              lastMessage: optimisticMessage
            };
          }
          return room;
        });
      });
      
      // Actually send the message via API
      const result = await sendMessageViaApi({ roomId, text, receiverId, tempId: finalTempId });
      
      // No need to update messages again as WebSocket will handle the real message update
      return result;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  }, [userId, activeRoom]);

  // Create a new chat room
  const createChatRoom = useCallback(async ({ name, participantIds }: CreateRoomParams) => {
    try {
      // Make sure we have valid input
      if (!name || !participantIds || participantIds.length === 0) {
        throw new Error('Invalid chat room parameters');
      }
      
      // Add current user as participant if not already included
      // This ensures the current user is always part of the created room
      if (!participantIds.includes(userId)) {
        console.log('Adding current user to participants list');
        participantIds = [...participantIds, userId];
      }

      console.log('Creating new chat room:', { name, participantIds });
      const newRoom = await createNewChatRoom({ name, participantIds });
      
      if (!newRoom || !newRoom.id) {
        throw new Error('Invalid response from server when creating chat room');
      }
      
      console.log('New chat room created successfully:', newRoom);
      setChatRooms(prev => [...prev, newRoom]);
      return newRoom;
    } catch (err) {
      console.error('Error creating chat room:', err);
      throw err;
    }
  }, [userId]);

  // Upload a file attachment
  const uploadAttachment = useCallback(async ({ roomId, file, receiverId }: UploadAttachmentParams) => {
    try {
      const newMessage = await uploadFileAttachment({ roomId, file, receiverId });
      setMessages(prev => [...prev, newMessage]);
      return true;
    } catch (err) {
      console.error('Error uploading file:', err);
      return false;
    }
  }, []);
  
  // Start a direct chat with another user
  const startDirectChat = useCallback(async (otherUserId: number) => {
    try {
      console.log(`Attempting to start direct chat with user ${otherUserId}`);
      
      // Check if we already have a 1-on-1 chat with this user
      const existingRoom = chatRooms.find(room => {
        // Direct chat should have exactly 2 participants
        if (room.participants.length === 2) {
          // Check if current user and target user are in the room
          const hasCurrentUser = room.participants.some(p => String(p.id) === String(userId));
          const hasTargetUser = room.participants.some(p => String(p.id) === String(otherUserId));
          
          return hasCurrentUser && hasTargetUser && !room.isGroup;
        }
        return false;
      });
      
      // If a chat already exists, return it
      if (existingRoom) {
        console.log('Found existing direct chat room:', existingRoom.id);
        return existingRoom;
      }
      
      console.log('No existing chat room found, creating new one...');
      
      // Otherwise, create a new 1-on-1 chat room
      // First, fetch user info to get their name
      const { data: userData } = await axios.get(`/api/users/${otherUserId}/`);
      
      if (!userData) {
        throw new Error('Could not fetch user information');
      }
      
      // Create a new room with a name based on the other user's name
      const roomName = userData.name || `Chat với ${userData.username || `Người dùng ${otherUserId}`}`;
      
      console.log('Creating new direct chat room with name:', roomName);      // Create new chat room with just 2 participants
      const newRoom = await createNewChatRoom({
        name: roomName,
        participantIds: [userId, otherUserId],
        isDirectChat: true // Đánh dấu đây là phòng chat 1-1
      });
      
      // Add the new room to our state
      setChatRooms(prev => [...prev, newRoom]);
      
      console.log('New direct chat room created:', newRoom.id);
      return newRoom;
    } catch (err) {
      console.error('Error starting direct chat:', err);
      throw err;
    }
  }, [chatRooms, userId, createNewChatRoom]);

  // Set typing status
  const setTypingStatus = useCallback((isTyping: boolean) => {
    if (!activeRoom) return;
    
    websocket.sendMessage({
      type: 'typing',
      user_id: userId,
      username: contacts.find(c => c.id === userId)?.name || 'User',
      is_typing: isTyping
    });
    
  }, [activeRoom, userId, contacts, websocket]);  // Initialize the chat service
  useEffect(() => {

    isMountedRef.current = true;
    loadChatRooms();
    
    // Giảm tần suất cập nhật danh sách phòng, vì WebSocket sẽ xử lý phần lớn các cập nhật
    // Chỉ cập nhật định kỳ để đảm bảo dữ liệu không bị thiếu trong trường hợp WebSocket bị lỗi
    const refreshInterval = setInterval(() => {
      if (!isLoadingRef.current && isMountedRef.current) {
        console.log('Performing periodic chat rooms refresh');
        loadChatRooms();
      }
    }, 60000); // Cập nhật mỗi phút thay vì 30 giây
    
    return () => {
      clearInterval(refreshInterval);
      isMountedRef.current = false;
    };
  }, [loadChatRooms]);

  return {
    contacts,
    chatRooms,
    messages,
    loading,
    error,
    activeRoom,
    connectionState,
    loadChatRooms,
    loadMessages,
    sendMessage,
    createChatRoom,
    uploadAttachment,
    markMessagesAsRead,
    setActiveChatRoom,
    setTypingStatus,
    startDirectChat
  };
};
