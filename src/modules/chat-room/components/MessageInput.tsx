import React, { useState } from 'react';
import styles from './MessageInput.module.css';
import { FiSmile, FiPaperclip, FiSend, FiImage, FiFile } from 'react-icons/fi';
import { ChatRoom } from './types';

interface MessageInputProps {
  activeRoom: ChatRoom | null;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (e: React.FormEvent) => void;
  handleAttachmentUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => void;
  setTypingStatus: (isTyping: boolean) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  activeRoom,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleAttachmentUpload,
  setTypingStatus,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setTypingStatus(e.target.value.length > 0);
  };

  if (!activeRoom) {
    return null;
  }

  return (
    <div className={styles.inputContainer}>
      <div className={styles.inputActions}>
        <button
          className={styles.actionButton}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <FiSmile />
        </button>
        <div className={styles.attachButtonContainer}>
          <button
            className={styles.actionButton}
            onClick={() => setShowAttachMenu(!showAttachMenu)}
          >
            <FiPaperclip />
          </button>
          {showAttachMenu && (
            <div className={styles.attachMenu}>
              <label className={styles.attachOption}>
                <FiImage />
                <span>Hình ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    handleAttachmentUpload(e, 'image');
                    setShowAttachMenu(false);
                  }}
                />
              </label>
              <label className={styles.attachOption}>
                <FiFile />
                <span>Tài liệu</span>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    handleAttachmentUpload(e, 'document');
                    setShowAttachMenu(false);
                  }}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={handleNewMessageChange}
          className={styles.messageInput}
        />
        <button type="submit" className={styles.sendButton}>
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
