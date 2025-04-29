export interface User {
  id: number;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: string;
}

export interface Contact extends User {
  unread: number;
  isActive: boolean;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
  status: MessageStatus;
  attachments?: Attachment[];
}

export interface ChatRoom {
  id: number;
  name: string;
  participants: User[];
  isGroup: boolean;
  lastMessage?: Message;
  unreadCount: number;
}

export type AttachmentType = 'image' | 'document' | 'audio' | 'video';

export interface Attachment {
  id: number;
  type: AttachmentType;
  url: string;
  name: string;
  size: number;
  preview?: string;
}
