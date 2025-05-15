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
    // Log the structure to help debugging
  console.log('Formatting message:', {
    id: message.message_id || message.id,
    senderId,
    content: message.content,
    sent_at: message.sent_at,
    is_read: message.is_read,
    fullMessage: JSON.stringify(message).substring(0, 200) // Show first 200 chars of full message
  });
  
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
