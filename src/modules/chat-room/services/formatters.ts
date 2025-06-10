import { ChatContact, ChatMessage, ChatRoom, MessageStatus } from './types';

/**
 * Hàm format response từ API sang ChatContact
 */
export const formatContactFromResponse = (contact: any): ChatContact => {
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

/**
 * Hàm format response từ API sang ChatRoom
 */
export const formatChatRoomFromResponse = (room: any): ChatRoom => {
  // Ensure participants is an array and handle possible null/undefined values
  const rawParticipants = Array.isArray(room.participants) ? room.participants : [];
    const participants = rawParticipants
    .filter((participant: any) => participant !== null && participant !== undefined)
    .map((participant: any) => {
      // Check for different participant data structures
      // Some APIs return participant.user as the actual user data
      const user = participant.user || participant;
    
      // Validate and provide fallbacks for each user property
      return {
        id: user.user_id || user.id || participant.user_id || participant.id || '',
        name: user.full_name || user.name || participant.full_name || participant.name || 'Người dùng',
        avatar: user.avatar || participant.avatar || null,
        isOnline: user.is_online || user.isOnline || participant.is_online || participant.isOnline || false,
        lastSeen: user.last_seen || user.lastSeen || participant.last_seen || participant.lastSeen || 'Offline',
      };
    });

  let lastMessage = undefined;
  if (room.last_message) {
    // Safely access nested properties
    const sentBy = room.last_message.sent_by || {};
    
    lastMessage = {
      id: room.last_message.message_id || room.last_message.id || '',
      senderId: sentBy.user_id || sentBy.id || '',
      text: room.last_message.content || '',
      timestamp: new Date(room.last_message.sent_at || Date.now()).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: room.last_message.is_read ? 'read' as MessageStatus : 'delivered' as MessageStatus,
    };
  }
  return {
    id: room.chatroom_id || room.id || '',
    name: room.name || 'Chat Room',
    senderId: room.created_by?.user_id || room.senderId || '',
    participants,
    isGroup: participants.length > 2,
    lastMessage,
    unreadCount: room.unread_count || 0,
  };
};

/**
 * Hàm format response từ API sang ChatMessage
 */
export const formatMessageFromResponse = (message: any): ChatMessage => {
  if (!message) {
    console.error('Empty message object passed to formatMessageFromResponse');
    return {
      id: `temp-${Date.now()}`,
      senderId: '',
      text: '⚠️ Message formatting error',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'sent' as MessageStatus,
    };
  }
  
  // Ensure we have both sent_by and sender objects
  const sender = message.sent_by || message.sender || {};
  
  // Sometimes we get user_id, sometimes just id, or sender might be a string ID already
  let senderId = '';
  if (typeof sender === 'string') {
    senderId = sender;
  } else if (typeof sender === 'object') {
    senderId = sender.user_id || sender.id || '';
  }
  
  // If we still don't have a sender ID, check if there's a direct sender_id property
  if (!senderId && message.sender_id) {
    senderId = message.sender_id;
  }
  
  return {
    id: message.message_id || message.id,
    senderId: senderId,
    text: message.content,
    timestamp: new Date(message.sent_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: message.is_read ? 'read' as MessageStatus : 'delivered' as MessageStatus,
  };
};
