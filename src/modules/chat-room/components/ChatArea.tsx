import React from 'react';
import styles from './ChatArea.module.css';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';
import { ChatRoom, Contact } from './types';

interface ChatAreaProps {
  activeRoom: ChatRoom | null;
  activeContact: Contact | null;
  messages: any[];
  userId: number | string;
  showParticipants: boolean;
  setShowParticipants: React.Dispatch<React.SetStateAction<boolean>>;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (e: React.FormEvent) => void;
  handleAttachmentUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => void;
  setTypingStatus: (isTyping: boolean) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  activeRoom,
  activeContact,
  messages,
  userId,
  showParticipants,
  setShowParticipants,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleAttachmentUpload,
  setTypingStatus,
}) => {
  return (
    <div className={styles.chatArea}>
      <ChatHeader 
        activeContact={activeContact}
        showParticipants={showParticipants}
        setShowParticipants={setShowParticipants}
      />
      
      <MessagesList 
        messages={messages}
        userId={userId}
      />
      
      <MessageInput 
        activeRoom={activeRoom}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleAttachmentUpload={handleAttachmentUpload}
        setTypingStatus={setTypingStatus}
      />
    </div>
  );
};

export default ChatArea;
