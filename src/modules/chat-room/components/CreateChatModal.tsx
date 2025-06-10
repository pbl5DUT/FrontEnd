import React from 'react';
import styles from './CreateChatModal.module.css';
import { FiX } from 'react-icons/fi';
import Avatar from './Avatar';

interface CreateChatModalProps {
  showNewChatModal: boolean;
  setShowNewChatModal: React.Dispatch<React.SetStateAction<boolean>>;
  newChatName: string;
  setNewChatName: React.Dispatch<React.SetStateAction<string>>;
  selectedParticipants: string[];
  setSelectedParticipants: React.Dispatch<React.SetStateAction<string[]>>;
  contacts: any[];
  handleCreateChatRoom: () => void;
  handleParticipantToggle: (userId: string) => void;
  isAdmin?: boolean; // Người dùng có phải admin không
  loadingMembers?: boolean; // Đang tải danh sách thành viên
}

const CreateChatModal: React.FC<CreateChatModalProps> = ({
  showNewChatModal,
  setShowNewChatModal,
  newChatName,
  setNewChatName,
  selectedParticipants,
  contacts,
  handleCreateChatRoom,
  handleParticipantToggle,
  isAdmin,
  loadingMembers
}) => {
  if (!showNewChatModal) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Tạo trò chuyện mới</h2>
          <button 
            className={styles.closeButton} 
            onClick={() => setShowNewChatModal(false)}
          >
            ×
          </button>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label>Tên nhóm</label>
            <input
              type="text"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="Nhập tên nhóm trò chuyện"
              className={styles.modalInput}
            />
          </div>          <div className={styles.formGroup}>
            <label>
              Người tham gia
              <span className={styles.labelNote}> (Bạn có thể thêm bất kỳ người dùng nào trong hệ thống)</span>
            </label>
            {loadingMembers && (
              <div className={styles.loadingMessage}>Đang tải danh sách người dùng...</div>
            )}
            {selectedParticipants.length > 0 && (
              <div className={styles.selectedParticipants}>
                {selectedParticipants.map((participantId) => {
                  const participant = contacts.find(c => c.id === participantId);
                  return (
                    <div className={styles.participantTag} key={participantId}>
                      <span className={styles.participantName}>{participant?.name}</span>
                      <button 
                        className={styles.removeParticipant}
                        onClick={() => handleParticipantToggle(participantId)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className={styles.participantsList}>
              {contacts.map((contact) => (
                <div 
                  key={contact.id}
                  className={styles.participantItem}
                >
                  <input
                    type="checkbox"
                    id={`contact-${contact.id}`}                    checked={selectedParticipants.includes(String(contact.id))}
                    onChange={() => handleParticipantToggle(String(contact.id))}
                  />
                  <label htmlFor={`contact-${contact.id}`}>                    <Avatar
                      name={contact.name}
                      avatar={contact.avatar}
                      size="small"
                    />
                    {contact.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.modalActions}>
          <button
            className={styles.cancelButton}
            onClick={() => setShowNewChatModal(false)}
          >
            Hủy
          </button>
          <button
            className={styles.createButton}
            onClick={handleCreateChatRoom}
          >
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChatModal;
