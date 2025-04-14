"use client";

import React, { useState } from "react";
import styles from "./chatroomPage.module.css";

const ChatRoomPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("Nguyen Van A");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={styles.chatroomContainer}>
      {/* Left Section */}
      <div className={styles.leftSection}>
        <input
          type="text"
          placeholder="Tìm kiếm người dùng, nhóm"
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        <div className={styles.filterTabs}>
          <button className={styles.activeTab}>Người dùng</button>
          <button>Nhóm</button> 
        </div>
        <ul className={styles.userList}>
          <li onClick={() => setSelectedUser("Nguyen Van A")}>Nguyen Van A</li>
          <li onClick={() => setSelectedUser("Nguyen Van B")}>Nguyen Van B</li>
        </ul>
      </div>

      {/* Middle Section */}
      <div className={styles.middleSection}>
        <div className={styles.chatHeader}>
            <h3>{selectedUser}</h3>
            <span>Đang trực tuyến</span>
        </div>
        <div className={styles.chatMessages}>
            {/* Tin nhắn mẫu */}
            <div className={styles.message}>
            <div className={styles.avatar}>
                <img src="/user-avatar.png" alt="Avatar" />
            </div>
            <div className={styles.messageContent}>
                <p className={styles.senderName}>Nguyen Van A</p>
                <p className={styles.text}>Chào bạn! Đây là tin nhắn đầu tiên.</p>
            </div>
            </div>
            <div className={`${styles.message} ${styles.selfMessage}`}>
            <div className={styles.messageContent}>
                <p className={styles.text}>Xin chào! Rất vui được gặp bạn.</p>
            </div>
            </div>
        </div>
        <div className={styles.chatInputContainer}>
            <button className={styles.attachmentButton}>
            <img src="/assets/attach-document.png" alt="Attachment" />
            </button>
            <input
            type="text"
            placeholder="Nhập tin nhắn..."
            className={styles.chatInput}
            />
            <button className={styles.sendButton}>
            <img src="/assets/send-message.png" alt="Send" />
            </button>
        </div>
        </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        <h3>Tệp đính kèm</h3>
        {/* File attachments*/}
      </div>
    </div>
  );
};

export default ChatRoomPage;