import * as ComponentTypes from './types';
import * as ServiceTypes from '../services/types';

/**
 * Adapters to convert between service types and component types
 */

// Convert service ChatRoom to component ChatRoom
export const adaptServiceChatRoom = (room: ServiceTypes.ChatRoom): ComponentTypes.ChatRoom => {
  // Validate and ensure participants array is properly formatted
  const safeParticipants = Array.isArray(room.participants) 
    ? room.participants.filter(p => p !== null && p !== undefined)
    : [];
  
  return {
    id: room.id,
    name: room.name,
    isGroup: room.isGroup,
  participants: safeParticipants.map(participant => {
      // Treat the participant as any to handle additional properties not in the type
      const pAny = participant as any;
      // Extract user data from nested structure if it exists
      const userData = pAny.user || participant;
      
      return {
        id: userData.id || userData.user_id || pAny.id || pAny.user_id || '',
        name: userData.name || userData.full_name || pAny.name || pAny.full_name || 'Người dùng',
        avatar: userData.avatar || pAny.avatar,
        isOnline: userData.isOnline || userData.is_online || pAny.isOnline || pAny.is_online || false,
        lastSeen: userData.lastSeen || userData.last_seen || pAny.lastSeen || pAny.last_seen || ''
      };
    }),
    unreadCount: room.unreadCount || 0,
    senderId: room.senderId,
    lastMessage: room.lastMessage ? {
      text: room.lastMessage.text,
      timestamp: room.lastMessage.timestamp
    } : undefined
  };
};

// Convert component ChatRoom to service ChatRoom
export const adaptComponentChatRoom = (room: ComponentTypes.ChatRoom): ServiceTypes.ChatRoom => {
  return {
    id: room.id,
    name: room.name,
    isGroup: room.isGroup,
    participants: room.participants,
    unreadCount: room.unreadCount,
    senderId: room.senderId?.toString() || '',
    lastMessage: room.lastMessage ? {
      id: '',
      senderId: '',
      text: room.lastMessage.text,
      timestamp: room.lastMessage.timestamp,
      status: 'sent'
    } : undefined
  };
};

// Convert service Message to component Message
export const adaptServiceMessage = (message: ServiceTypes.ChatMessage): ComponentTypes.Message => {
  return {
    id: message.id,
    senderId: message.senderId,
    text: message.text,
    timestamp: message.timestamp,
    status: message.status,
    tempId: message.tempId
  };
};

// Convert component Message to service Message
export const adaptComponentMessage = (message: ComponentTypes.Message): ServiceTypes.ChatMessage => {
  return {
    id: message.id,
    senderId: message.senderId,
    text: message.text,
    timestamp: message.timestamp,
    status: message.status || 'sent',
    tempId: message.tempId
  };
};
