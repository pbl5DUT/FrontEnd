// Types/interfaces cho các đối tượng chat
export type ChatUser = {
  id: number | string;
  user_id?: string | number; // Alternative field name for id
  name?: string;
  full_name?: string; // Alternative field name for name
  avatar: string | null;
  isOnline?: boolean;
  is_online?: boolean; // Alternative field name for isOnline
  lastSeen?: string;
  last_seen?: string; // Alternative field name for lastSeen
  user?: ChatUser; // To handle nested user objects in participants
};

export type ChatContact = ChatUser & {
  id: string;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: string;
  unread: number;
  isActive: boolean;
  email?: string;
};

export type MessageStatus = 'sent' | 'delivered' | 'read';

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: MessageStatus;
  attachments?: ChatAttachment[];
  tempId?: string;
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

// Định nghĩa loại trạng thái kết nối
export type ConnectionState = 'connected' | 'disconnected' | 'connecting';

// Định nghĩa các tham số cho các hàm chat
export interface SendMessageParams {
  roomId: number | string;
  text: string;
  receiverId?: number;
  tempId?: string;
}

export interface UploadAttachmentParams {
  roomId: number | string;
  file: File;
  receiverId?: number;
}

export interface CreateRoomParams {
  name: string;
  participantIds: (number | string)[];
  isDirectChat?: boolean;
}
