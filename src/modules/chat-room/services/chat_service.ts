import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import axios from 'axios';


// Thiết lập các URL cơ sở
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || `${BASE_URL}/api`;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || `${BASE_URL}/ws`;

// Định nghĩa các endpoint API
const CHATROOMS_ENDPOINT = `${API_URL}/chatrooms/`;
const USERS_ENDPOINT = `${API_URL}/users/`;
const MESSAGES_ENDPOINT = `${API_URL}/messages/`;

export type ChatUser = {
  id: number;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: string;
};

export type ChatContact = ChatUser & {
  unread: number;
  isActive: boolean;
};

export type MessageStatus = 'sent' | 'delivered' | 'read';

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: MessageStatus;
  attachments?: ChatAttachment[];
};

export type ChatRoom = {
  id: string | number;  
  name: string;
  senderId: string; 
  participants: ChatUser[];
  isGroup: boolean;
  lastMessage?: ChatMessage;
  unreadCount: number;
};

export type AttachmentType = 'image' | 'document' | 'audio' | 'video';

export type ChatAttachment = {
  id: number;
  type: AttachmentType;
  url: string;
  name: string;
  size: number;
  preview?: string;
};

// Format API response to match our frontend types
const formatContactFromResponse = (contact: any): ChatContact => {
  return {
    id: contact.user_id,
    name: contact.full_name,
    avatar: contact.avatar,
    isOnline: contact.is_online || false,
    lastSeen: contact.last_seen || 'Offline',
    unread: contact.unread_count || 0,
    isActive: false,
  };
};

const formatChatRoomFromResponse = (room: any): ChatRoom => {
  const participants = room.participants.map((user: any) => ({
    id: user.user_id,
    name: user.full_name,
    avatar: user.avatar,
    isOnline: user.is_online || false,
    lastSeen: user.last_seen || 'Offline',
  }));

  let lastMessage = undefined;
  if (room.last_message) {
    lastMessage = {
      id: room.last_message.message_id,
      senderId: room.last_message.sent_by.user_id,
      text: room.last_message.content,
      timestamp: new Date(room.last_message.sent_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: room.last_message.is_read ? 'read' as MessageStatus : 'delivered' as MessageStatus,
    };
  }

  return {
    id: room.chatroom_id,
    name: room.name,
    senderId: room.created_by?.user_id || '',
    participants,
    isGroup: participants.length > 2,
    lastMessage,
    unreadCount: room.unread_count || 0,
  };
};

const formatMessageFromResponse = (message: any): ChatMessage => {
  return {
    id: message.message_id,
    senderId: message.sent_by.user_id,
    text: message.content,
    timestamp: new Date(message.sent_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: message.is_read ? 'read' as MessageStatus : 'delivered' as MessageStatus,
  };
};

export const useChatService = (userId: number) => {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  // Initialize socket reference
  const socketRef = useRef<WebSocket | null>(null);

  // IMPORTANT: Define all callback functions before they're used in dependency arrays
  
  // Define markMessagesAsRead first as it's used in other functions
  const markMessagesAsRead = useCallback((messageIds: string[]) => {
    if (!activeRoom) return;
    
    // Send message read status via WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'mark_read',
        message_ids: messageIds,
        user_id: userId
      }));
    }
    
    // Also update locally
    setMessages(prev => 
      prev.map(msg => 
        messageIds.includes(msg.id) ? {...msg, status: 'read'} : msg
      )
    );
    
    // Update unread count in chat rooms
    if (activeRoom) {
      setChatRooms(prev => 
        prev.map(room => 
          room.id === activeRoom.id ? {...room, unreadCount: 0} : room
        )
      );
    }
  }, [activeRoom, userId]);

  // Handle WebSocket messages - depends on markMessagesAsRead
  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === 'chat_message') {
      const newMessage = formatMessageFromResponse(data.message);
      
      // Add message to current chat if it belongs there
      if (activeRoom && data.message.chatroom_id === activeRoom.id) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // Mark as read if we're the recipient and in the chat
        if (data.message.receiver_id === userId) {
          markMessagesAsRead([data.message.id]);
        }
      }
      
      // Update chat rooms with new message
      setChatRooms(prevRooms => {
        return prevRooms.map(room => {
          if (room.id === data.message.chatroom_id) {
            return {
              ...room,
              lastMessage: newMessage,
              unreadCount: data.message.receiver_id === userId ? room.unreadCount + 1 : room.unreadCount
            };
          }
          return room;
        });
      });
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
    } else if (data.type === 'typing') {
      // Handle typing indicators if needed
      console.log(`User ${data.username} is ${data.is_typing ? 'typing' : 'stopped typing'}`);
    }
  }, [activeRoom, userId, markMessagesAsRead]);

  // WebSocket connection effect - depends on handleWebSocketMessage
  useEffect(() => {
    if (!userId) return;

    // Clean up function to handle socket closure
    const cleanupSocket = () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
    
    // No active room, don't connect yet
    if (!activeRoom) return cleanupSocket;
    
    const roomName = `chat_${activeRoom.id}`;
    const wsUrl = `${WS_URL}/chat/${roomName}/`;
    
    // Check authentication before connecting
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('No authentication token found for WebSocket connection');
      return cleanupSocket;
    }
    
    // Create WebSocket connection with authentication
    const newSocket = new WebSocket(`${wsUrl}?token=${token}`);
    socketRef.current = newSocket;
    
    // Socket event handlers
    newSocket.onopen = () => {
      console.log('WebSocket connected to room:', roomName);
      setSocket(newSocket);
    };
    
    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
    };
    
    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
    };
    
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    // Clean up on unmount or when room changes
    return cleanupSocket;
  }, [userId, activeRoom, handleWebSocketMessage]);

  // Load messages for a specific chat room - depends on markMessagesAsRead
  const loadMessages = useCallback(async (roomId: string | number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/chatrooms/${roomId}/messages/`);
      const formattedMessages = response.data.map(formatMessageFromResponse);
      setMessages(formattedMessages);
      setError(null);
      
      // No need to explicitly join the room - we'll reconnect the WebSocket
      // when the active room changes via the useEffect hook
      
      // Mark messages as read
      const unreadMessages = response.data
        .filter((msg: any) => !msg.is_read && msg.receiver_id?.user_id === userId)
        .map((msg: any) => msg.message_id);
        
      if (unreadMessages.length > 0) {
        markMessagesAsRead(unreadMessages);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [userId, markMessagesAsRead]);

  // Set active chat room - depends on loadMessages
  const setActiveChatRoom = useCallback((room: ChatRoom) => {
    setActiveRoom(room);
    loadMessages(room.id);
    
    // Update chat rooms to mark selected room as active
    setChatRooms(prevRooms => {
      return prevRooms.map(r => ({
        ...r,
        isActive: r.id === room.id
      }));
    });
  }, [loadMessages]);
  // Tải danh sách phòng chat
  const loadChatRooms = useCallback(async () => {
    if (!userId) return;
    
    // Kiểm tra token có tồn tại không
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Đang tải phòng chat cho người dùng:', userId);
      
      // Sử dụng axiosInstance thay vì axios trực tiếp
      const response = await axiosInstance.get(CHATROOMS_ENDPOINT);
      console.log('Phản hồi:', response);
      const formattedRooms = response.data.map(formatChatRoomFromResponse);
      setChatRooms(formattedRooms);
      
      // Tải danh sách người dùng
      const usersResponse = await axiosInstance.get('/users/');
      const formattedContacts = usersResponse.data.map(formatContactFromResponse);
      setContacts(formattedContacts);
      
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải phòng chat:', err);
      setError('Không thể tải dữ liệu phòng chat');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Send a message
  const sendMessage = useCallback(async (roomId: number, text: string, receiverId?: number) => {
    try {
      // Add optimistic message to state
      const tempId = Date.now();
      const optimisticMessage: ChatMessage = {
        id: tempId.toString(),
        senderId: userId.toString(),
        text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'sent',
      };
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Send via API
      const response = await axiosInstance.post(`/messages/`, {
        content: text,
        chatroom: roomId,
        receiver_id: receiverId
      });
      
      // Replace optimistic message with real one
      const realMessage = formatMessageFromResponse(response.data);
      setMessages(prev => 
        prev.map(msg => msg.id === tempId.toString() ? realMessage : msg)
      );
      
      // Send via WebSocket as well
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'chat_message',
          content: text,
          sender_id: userId,
          chatroom_id: roomId,
          receiver_id: receiverId
        }));
      }
      
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== Date.now().toString()));
      return false;
    }
  }, [userId]);

  // Create a new chat room
  const createChatRoom = useCallback(async (name: string, participantIds: number[] = []) => {
    try {
      const response = await axiosInstance.post(CHATROOMS_ENDPOINT, {
        name,
        participant_ids: participantIds
      });
      
      const newRoom = formatChatRoomFromResponse(response.data);
      setChatRooms(prev => [...prev, newRoom]);
      return newRoom;
    } catch (err) {
      console.error('Error creating chat room:', err);
      throw err;
    }
  }, []);

  // Upload a file attachment
  const uploadAttachment = useCallback(async (roomId: number, file: File, receiverId?: number) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatroom_id', roomId.toString());
      if (receiverId) {
        formData.append('receiver_id', receiverId.toString());
      }
      
      const response = await axiosInstance.post(
        `/messages/upload_attachment/`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      const newMessage = formatMessageFromResponse(response.data);
      setMessages(prev => [...prev, newMessage]);
      return true;
    } catch (err) {
      console.error('Error uploading file:', err);
      return false;
    }  }, []);
  
  // Initialize the chat service
  useEffect(() => {
    const init = async () => {
      loadChatRooms();
    };
    
    init();
  }, [loadChatRooms]);

  // Set typing status
  const setTypingStatus = useCallback((isTyping: boolean) => {
    if (!activeRoom || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    socketRef.current.send(JSON.stringify({
      type: 'typing',
      user_id: userId,
      username: contacts.find(c => c.id === userId)?.name || 'User',
      is_typing: isTyping
    }));
  }, [activeRoom, userId, contacts]);

  return {
    contacts,
    chatRooms,
    messages,
    loading,
    error,
    activeRoom,
    loadChatRooms,
    loadMessages,
    sendMessage,
    createChatRoom,
    uploadAttachment,
    markMessagesAsRead,
    setActiveChatRoom,
    setTypingStatus
  };
}
