import * as ComponentTypes from './types';
import * as ServiceTypes from '../services/types';

/**
 * Adapters to convert between service types and component types
 */

// Convert service ChatRoom to component ChatRoom
export const adaptServiceChatRoom = (room: ServiceTypes.ChatRoom): ComponentTypes.ChatRoom => {
  return {
    id: room.id,
    name: room.name,
    isGroup: room.isGroup,
    participants: room.participants,
    unreadCount: room.unreadCount,
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
