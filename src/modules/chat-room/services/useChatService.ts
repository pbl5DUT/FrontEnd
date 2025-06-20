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
export const useChatService = (userId: string) => {
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
  }  // Handle WebRTC signaling messages
  if (data.type === 'call_offer' || data.type === 'call_answer' || 
      data.type === 'ice_candidate' || data.type === 'call_end') {
    // Log the signaling message for debugging
    console.log(`WebRTC ${data.type} signal received:`, data);
    
    // Make sure we have valid userId for both sides
    // Convert to number to ensure consistent types
    if (data.userId) {
      data.userId = Number(data.userId);
    }
    if (data.user_id) {
      data.user_id = Number(data.user_id);
    }
    
    // Add chatroom_id if it's not present but roomId is
    if (!data.chatroom_id && data.roomId) {
      data.chatroom_id = data.roomId;
    }
    
    // Add roomId if it's not present but chatroom_id is
    if (!data.roomId && data.chatroom_id) {
      data.roomId = data.chatroom_id;
    }
    
    // Emit a custom event for this WebRTC message that can be listened to by components
    const event = new CustomEvent('webrtc_signal', { detail: data });
    window.dispatchEvent(event);
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
      // const optimisticMessage: ChatMessage = {
      //   id: `temp-${finalTempId}`,
      //   senderId: userId.toString(),
      //   text: text,
      //   timestamp: new Date().toLocaleTimeString([], {
      //     hour: '2-digit',
      //     minute: '2-digit',
      //   }),
      //   status: 'sent',
      //   tempId: finalTempId
      // };
      
      // // Add optimistic message to UI immediately
      // setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      
      // Update chat room with last message
      // setChatRooms(prevRooms => {
      //   return prevRooms.map(room => {
      //     if (room.id === activeRoom?.id) {
      //       return {
      //         ...room,
      //         lastMessage: optimisticMessage
      //       };
      //     }
      //     return room;
      //   });
      // });
      
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
  const createChatRoom = useCallback(async ({ name, participantIds, isDirectChat = false }: CreateRoomParams) => {
    try {
      // Make sure we have valid input
      if (!name || !participantIds || participantIds.length === 0) {
        throw new Error('Invalid chat room parameters');
      }
      
      // Chuẩn hóa định dạng userId
      const currentUserId = String(userId);
      
      // Đảm bảo ID người dùng hiện tại đúng định dạng khi thêm vào
      const formattedCurrentUserId = currentUserId.startsWith('user-') ? 
        currentUserId : `user-${currentUserId}`;
        
      // Add current user as participant if not already included
      // This ensures the current user is always part of the created room
      const userIdIncluded = participantIds.some(id => 
        String(id) === currentUserId || 
        String(id) === formattedCurrentUserId
      );
      
      if (!userIdIncluded) {
        console.log('Adding current user to participants list:', formattedCurrentUserId);
        participantIds = [...participantIds, formattedCurrentUserId];
      }

      console.log('Creating new chat room:', { 
        name, 
        participantIds,
        isDirectChat 
      });
      const newRoom = await createNewChatRoom({ 
        name, 
        participantIds,
        isDirectChat 
      });
      
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
  const startDirectChat = useCallback(async (otherUserId: number | string) => {
    try {
      console.log(`Attempting to start direct chat with user ${otherUserId}`);
      
      // Check if we already have a 1-on-1 chat with this user
      const existingRoom = chatRooms.find(room => {
        // Direct chat should have exactly 2 participants
        if (room.participants.length === 2) {
          // Chuẩn hóa ID để so sánh chính xác
          const currentUserStr = String(userId);
          const targetUserStr = String(otherUserId);
          
          // Kiểm tra cả định dạng có tiền tố và không có tiền tố
          const normalizeId = (id: string) => {
            if (id.startsWith('user-')) return id;
            return `user-${id}`;
          };
          
          const currentUserIds = [currentUserStr, normalizeId(currentUserStr)];
          const targetUserIds = [targetUserStr, normalizeId(targetUserStr)];
          
          // Check if current user is in participants
          const hasCurrentUser = room.participants.some(p => 
            currentUserIds.includes(String(p.id)) || currentUserIds.includes(String(p.user_id))
          );
          
          // Check if target user is in participants
          const hasTargetUser = room.participants.some(p => 
            targetUserIds.includes(String(p.id)) || targetUserIds.includes(String(p.user_id))
          );
          
          return hasCurrentUser && hasTargetUser && !room.isGroup;
        }
        return false;
      });
      
      // If a chat already exists, return it
      if (existingRoom) {
        console.log('Found existing direct chat room:', existingRoom.id);
        return existingRoom;
      }
      
      console.log('No existing chat room found, creating new one with user ID:', otherUserId);
        // Otherwise, create a new 1-on-1 chat room
      // First, fetch user info to get their name
      // Định dạng ID người dùng cho API call - đảm bảo ID có định dạng "user-X"
      let apiUserId;
      if (typeof otherUserId === 'string' && otherUserId.startsWith('user-')) {
        // Nếu ID đã có định dạng "user-X", sử dụng trực tiếp
        apiUserId = otherUserId;
      } else {
        // Nếu ID là số hoặc không có tiền tố, thêm tiền tố "user-"
        apiUserId = `user-${otherUserId}`;
      }
      console.log('Fetching user data with API ID:', apiUserId);
      
      const { data: userData } = await axios.get(`/users/${apiUserId}/`);

      if (!userData) {
        throw new Error('Could not fetch user information');
      }
      
      // Create a new room with a name based on the other user's name
      const roomName = userData.full_name || (userData.email?.split('@')[0]) || 'Người dùng';

      console.log('Creating new direct chat room with name:', roomName);
      
      // Sử dụng trực tiếp ID người dùng từ API để đảm bảo đúng định dạng
      // Giữ nguyên định dạng chuỗi như "user-1" cho cuộc gọi API
      const userIdString = String(userId);
      console.log('Current user ID format:', userIdString);
      
      // Đảm bảo otherUserId được định dạng đúng (bảo toàn định dạng "user-X" nếu đã có)
      let otherUserIdString: string;
      if (typeof otherUserId === 'string') {
        if (otherUserId.startsWith('user-')) {
          // Đã có định dạng user-X, giữ nguyên
          otherUserIdString = otherUserId;
          console.log('Using existing user-X format ID:', otherUserIdString);
        } else {
          // Chuỗi nhưng không có định dạng user-X, thêm vào
          otherUserIdString = `user-${otherUserId}`;
          console.log('Adding user- prefix to string ID:', otherUserIdString);
        }
      } else {
        // Convert số thành định dạng chuỗi "user-X"
        otherUserIdString = `user-${otherUserId}`;
        console.log('Converting numeric ID to user-X format:', otherUserIdString);
      }
      
      console.log(`User IDs for chat creation: ${userIdString} and ${otherUserIdString} (original: ${userId} and ${otherUserId})`);
      
      // Create new chat room with just 2 participants
      // Use the string IDs for creation (API accepts string IDs)
      const newRoom = await createNewChatRoom({
        name: roomName,
        participantIds: [userIdString, otherUserIdString],
        isDirectChat: true // Đánh dấu đây là phòng chat 1-1
      });
      
      // Add the new room to our state
      setChatRooms(prev => [...prev, newRoom]);
      
      console.log('New direct chat room created:', newRoom.id);
      return newRoom;
    } catch (err: any) {
      console.error('Error starting direct chat:', err);
      // Provide more detailed error information for debugging
      if (err.response) {
        console.error('API Error Details:', {
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url,
        });
      }
      throw new Error(`Không thể tạo cuộc trò chuyện: ${err.message || 'Lỗi không xác định'}`);
    }
  }, [chatRooms, userId, createNewChatRoom]);

  // Set typing status
  const setTypingStatus = useCallback((isTyping: boolean) => {
    if (!activeRoom) return;
    
    const userIdStr = String(userId);

    websocket.sendMessage({
      type: 'typing',
      user_id: userIdStr,
      username: contacts.find(c => c.id === userIdStr)?.name || 'User',
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
    startDirectChat,
    websocket 
  };
};
