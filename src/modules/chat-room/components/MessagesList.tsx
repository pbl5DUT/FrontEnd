import React, { useRef, useEffect } from 'react';
import styles from './MessagesList.module.css';
import { Message } from './types';

interface MessagesListProps {
  messages: Message[];
  userId: number | string;
}

const MessagesList: React.FC<MessagesListProps> = ({ messages, userId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className={styles.messagesContainer}>
      <div className={styles.messagesList}>
        {messages.length === 0 && (
          <div className={styles.emptyMessages}>No messages yet. Start the conversation!</div>
        )}
        
        {messages.map((message, index) => {
          // Tạo key duy nhất dựa trên id và index
          const uniqueKey = message.isOptimistic ? `optimistic-${message.id}-${index}` : `message-${message.id}-${index}`;
          return (
            <div
              key={uniqueKey}
              className={`${styles.messageItem} ${
                message.senderId === userId.toString() ? styles.outgoing : styles.incoming
              }`}
            >
              <div className={styles.messageContent}>
                <div className={styles.messageText}>{message.text}</div>
                <div className={styles.messageTime}>
                  {message.timestamp}
                  {message.senderId === userId.toString() && (
                    <span className={styles.messageStatus}>
                      {message.status === 'sent' ? '✓' : '✓✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessagesList;
