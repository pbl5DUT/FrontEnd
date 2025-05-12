'use client';

import React, { useState } from 'react';
import styles from './CreateProjectModal.module.css';
import { Project, ProjectFormData } from '../../../types/project';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: ProjectFormData) => void;
  managers: { id: string; full_name: string }[];
  users: { user_id: string; full_name: string }[]; // Thêm danh sách users để chọn thành viên
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  managers,
  users,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    project_name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'Planning',
    progress: 0,
    manager_id: '', // Đổi tên từ manager thành manager_id
    members: [], // Thêm mảng members
  });

  // Sử dụng state để theo dõi danh sách thành viên đã chọn
  const [selectedMembers, setSelectedMembers] = useState<{
    user_id: string;
    role_in_project: string;
  }[]>([]);
  
  // Thêm state cho việc chọn thành viên mới
  const [newMember, setNewMember] = useState({
    user_id: '',
    role_in_project: 'Member'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.project_name?.trim()) {
      newErrors.project_name = 'Tên dự án không được để trống';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Mô tả dự án không được để trống';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Ngày bắt đầu không được để trống';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'Ngày kết thúc không được để trống';
    } else if (formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    
    if (!formData.status) {
      newErrors.status = 'Trạng thái không được để trống';
    }
    
    if (!formData.manager_id) {
      newErrors.manager_id = 'Vui lòng chọn người quản lý';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Xóa lỗi khi người dùng nhập
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Xử lý thay đổi trong newMember
  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Thêm thành viên mới vào danh sách
  const handleAddMember = () => {
    if (newMember.user_id && !selectedMembers.some(m => m.user_id === newMember.user_id)) {
      const updatedMembers = [...selectedMembers, { ...newMember }];
      setSelectedMembers(updatedMembers);
      setFormData(prev => ({
        ...prev,
        members: updatedMembers
      }));
      // Reset lựa chọn thành viên mới
      setNewMember({
        user_id: '',
        role_in_project: 'Member'
      });
    }
  };

  // Xóa thành viên khỏi danh sách
  const handleRemoveMember = (userId: string) => {
    const updatedMembers = selectedMembers.filter(m => m.user_id !== userId);
    setSelectedMembers(updatedMembers);
    setFormData(prev => ({
      ...prev,
      members: updatedMembers
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onCreateProject(formData);
      onClose();
      // Reset form
      setFormData({
        project_name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'Planning',
        progress: 0,
        manager_id: '',
        members: [],
      });
      setSelectedMembers([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Tạo dự án mới</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="project_name">Tên dự án <span className={styles.required}>*</span></label>
            <input
              type="text"
              id="project_name"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              className={errors.project_name ? styles.inputError : ''}
            />
            {errors.project_name && <div className={styles.errorMessage}>{errors.project_name}</div>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="description">Mô tả <span className={styles.required}>*</span></label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={errors.description ? styles.inputError : ''}
            />
            {errors.description && <div className={styles.errorMessage}>{errors.description}</div>}
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="start_date">Ngày bắt đầu <span className={styles.required}>*</span></label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={errors.start_date ? styles.inputError : ''}
              />
              {errors.start_date && <div className={styles.errorMessage}>{errors.start_date}</div>}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="end_date">Ngày kết thúc <span className={styles.required}>*</span></label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={errors.end_date ? styles.inputError : ''}
              />
              {errors.end_date && <div className={styles.errorMessage}>{errors.end_date}</div>}
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="status">Trạng thái <span className={styles.required}>*</span></label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={errors.status ? styles.inputError : ''}
              >
                <option value="Planning">Lập kế hoạch</option>
                <option value="In Progress">Đang tiến hành</option>
                <option value="On Hold">Tạm dừng</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
              {errors.status && <div className={styles.errorMessage}>{errors.status}</div>}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="progress">Tiến độ (%)</label>
              <input
                type="number"
                id="progress"
                name="progress"
                min="0"
                max="100"
                value={formData.progress}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="manager_id">Người quản lý <span className={styles.required}>*</span></label>
            <select
              id="manager_id"
              name="manager_id"
              value={formData.manager_id}
              onChange={handleChange}
              className={errors.manager_id ? styles.inputError : ''}
            >
              <option value="">Chọn người quản lý</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.full_name}
                </option>
              ))}
            </select>
            {errors.manager_id && <div className={styles.errorMessage}>{errors.manager_id}</div>}
          </div>
          
          {/* Thêm phần quản lý thành viên */}
          <div className={styles.membersSection}>
            <h3>Thành viên dự án</h3>
            
            <div className={styles.addMemberForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="user_id">Thành viên</label>
                  <select
                    id="user_id"
                    name="user_id"
                    value={newMember.user_id}
                    onChange={handleMemberChange}
                  >
                    <option value="">Chọn thành viên</option>
                    {users.filter(user => 
                      // Lọc ra những user chưa được thêm vào và khác với manager
                      !selectedMembers.some(m => m.user_id === user.user_id) && 
                      user.user_id !== formData.manager_id
                    ).map(user => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="role_in_project">Vai trò</label>
                  <select
                    id="role_in_project"
                    name="role_in_project"
                    value={newMember.role_in_project}
                    onChange={handleMemberChange}
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
                  disabled={!newMember.user_id}
                >
                  Thêm
                </button>
              </div>
            </div>
            
            {/* Danh sách thành viên đã chọn */}
            {selectedMembers.length > 0 && (
              <div className={styles.membersList}>
                <h4>Thành viên đã chọn:</h4>
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
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.submitButton}>
              Tạo dự án
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;