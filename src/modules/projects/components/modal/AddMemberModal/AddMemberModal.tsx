'use client';

import React, { useState } from 'react';
import styles from './AddMemberModal.module.css';
import { addProjectMembers } from '@/modules/projects/services/project_service';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  users: { user_id: string; full_name: string; email?: string }[];
  currentMembers: { user_id: string }[];
  onSuccess: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  users,
  currentMembers,
  onSuccess,
}) => {
  const [selectedMembers, setSelectedMembers] = useState<{
    user_id: string;
    role_in_project: string;
  }[]>([]);
  
  const [newMember, setNewMember] = useState({
    user_id: '',
    role_in_project: 'Member'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lọc ra những user chưa là thành viên của dự án và chưa được chọn
  const availableUsers = users.filter(user => 
    !currentMembers.some(member => member.user_id === user.user_id) &&
    !selectedMembers.some(member => member.user_id === user.user_id)
  );

  // Xử lý thay đổi trong newMember
  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa lỗi khi người dùng chọn
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Thêm thành viên vào danh sách chọn
  const handleAddMember = () => {
    if (!newMember.user_id) {
      setErrors({ user_id: 'Vui lòng chọn thành viên' });
      return;
    }

    if (!selectedMembers.some(m => m.user_id === newMember.user_id)) {
      setSelectedMembers(prev => [...prev, { ...newMember }]);
      setNewMember({
        user_id: '',
        role_in_project: 'Member'
      });
      setErrors({});
    }
  };

  // Xóa thành viên khỏi danh sách chọn
  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(prev => prev.filter(m => m.user_id !== userId));
  };

  // Xử lý submit với progress tracking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMembers.length === 0) {
      setErrors({ general: 'Vui lòng chọn ít nhất một thành viên để thêm' });
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress({ current: 0, total: selectedMembers.length });
    setErrors({});

    try {
      // Thêm từng thành viên và cập nhật progress
      const results = [];
      for (let i = 0; i < selectedMembers.length; i++) {
        const member = selectedMembers[i];
        setSubmitProgress({ current: i, total: selectedMembers.length });
        
        try {
          await addProjectMembers(projectId, [member]);
          results.push({ success: true, member });
        } catch (memberError) {
          console.error(`Error adding member ${member.user_id}:`, memberError);
          results.push({ 
            success: false, 
            member, 
            error: memberError instanceof Error ? memberError.message : 'Unknown error' 
          });
        }
      }
      
      setSubmitProgress({ current: selectedMembers.length, total: selectedMembers.length });
      
      // Kiểm tra kết quả
      const failedMembers = results.filter(r => !r.success);
      
      if (failedMembers.length > 0) {
        const failedNames = failedMembers.map(f => {
          const user = users.find(u => u.user_id === f.member.user_id);
          return user?.full_name || f.member.user_id;
        });
        
        setErrors({ 
          general: `Không thể thêm ${failedMembers.length} thành viên: ${failedNames.join(', ')}` 
        });
        
        // Chỉ xóa những thành viên đã thêm thành công
        const successfulIds = results.filter(r => r.success).map(r => r.member.user_id);
        setSelectedMembers(prev => prev.filter(m => !successfulIds.includes(m.user_id)));
      } else {
        // Tất cả thành công
        setSelectedMembers([]);
        setNewMember({ user_id: '', role_in_project: 'Member' });
        onSuccess();
        onClose();
      }
      
    } catch (error) {
      console.error('Error adding members:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Có lỗi xảy ra khi thêm thành viên' 
      });
    } finally {
      setIsSubmitting(false);
      setSubmitProgress({ current: 0, total: 0 });
    }
  };

  // Reset form khi đóng modal
  const handleClose = () => {
    if (isSubmitting) return; // Không cho đóng khi đang submit
    
    setSelectedMembers([]);
    setNewMember({ user_id: '', role_in_project: 'Member' });
    setErrors({});
    setSubmitProgress({ current: 0, total: 0 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Thêm thành viên vào dự án</h2>
          <button className={styles.closeButton} onClick={handleClose} disabled={isSubmitting}>
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.general && (
            <div className={styles.errorMessage} style={{ marginBottom: '1rem' }}>
              {errors.general}
            </div>
          )}

          {/* Progress bar khi đang submit */}
          {isSubmitting && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '8px',
                fontSize: '14px',
                color: '#374151'
              }}>
                <span>Đang thêm thành viên...</span>
                <span>{submitProgress.current}/{submitProgress.total}</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${submitProgress.total > 0 ? (submitProgress.current / submitProgress.total) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}

          <div className={styles.membersSection}>
            <h3>Chọn thành viên</h3>
            
            <div className={styles.addMemberForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="user_id">Thành viên <span className={styles.required}>*</span></label>
                  <select
                    id="user_id"
                    name="user_id"
                    value={newMember.user_id}
                    onChange={handleMemberChange}
                    className={errors.user_id ? styles.inputError : ''}
                    disabled={isSubmitting}
                  >
                    <option value="">Chọn thành viên</option>
                    {availableUsers.map(user => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.full_name} {user.email && `(${user.email})`}
                      </option>
                    ))}
                  </select>
                  {errors.user_id && <div className={styles.errorMessage}>{errors.user_id}</div>}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="role_in_project">Vai trò</label>
                  <select
                    id="role_in_project"
                    name="role_in_project"
                    value={newMember.role_in_project}
                    onChange={handleMemberChange}
                    disabled={isSubmitting}
                  >
                    <option value="Member">Thành viên</option>
                    <option value="Support">Hỗ trợ</option>
                    <option value="Observer">Quan sát viên</option>
                  </select>
                </div>
                
                <button
                  type="button"
                  className={styles.addMemberButton}
                  onClick={handleAddMember}
                  disabled={!newMember.user_id || isSubmitting}
                >
                  Thêm
                </button>
              </div>
            </div>

            {availableUsers.length === 0 && !isSubmitting && (
              <div className={styles.emptyState}>
                Không còn người dùng nào để thêm vào dự án.
              </div>
            )}
            
            {/* Danh sách thành viên đã chọn */}
            {selectedMembers.length > 0 && (
              <div className={styles.membersList}>
                <h4>Thành viên sẽ được thêm:</h4>
                <ul>
                  {selectedMembers.map(member => {
                    const user = users.find(u => u.user_id === member.user_id);
                    return (
                      <li key={member.user_id} className={styles.memberItem}>
                        <span>{user?.full_name || member.user_id}</span>
                        <span>({member.role_in_project})</span>
                        <button
                          type="button"
                          className={styles.removeMemberButton}
                          onClick={() => handleRemoveMember(member.user_id)}
                          disabled={isSubmitting}
                        >
                          &times;
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          
          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.cancelButton} 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Hủy'}
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={selectedMembers.length === 0 || isSubmitting}
            >
              {isSubmitting 
                ? `Đang thêm... (${submitProgress.current}/${submitProgress.total})`
                : `Thêm ${selectedMembers.length} thành viên`
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;