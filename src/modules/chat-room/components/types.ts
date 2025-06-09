 export interface Contact {
  id: number | string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  unread?: number;
  isActive?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  tempId?: string;
  isOptimistic?: boolean;
}

export interface ChatRoom {
  id: number | string;
  name: string;
  isGroup: boolean;
  participants: any[];
  unreadCount: number;
  senderId?: number | string;
  lastMessage?: {
    text: string;
    timestamp: string;
  };
}

export interface ProjectUser {
  id: number;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  projectName?: string;
}

export interface AttachmentUpload {
  roomId: number;
  file: File;
  receiverId?: number;
}

export interface CreateChatRoomParams {
  name: string;
  participantIds: number[];
}
