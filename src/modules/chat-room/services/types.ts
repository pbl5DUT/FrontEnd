// Types/interfaces cho các đối tượng chat
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
  participantIds: number[];
}
