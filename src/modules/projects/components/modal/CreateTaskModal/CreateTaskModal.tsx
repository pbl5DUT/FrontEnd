import React, { useState, useMemo } from 'react';
import styles from './CreateTaskModal.module.css';
import { createTask } from '../../../services/taskService';
import { useProject } from '../../../hooks/useProject';

interface CreateTaskModalProps {
  projectId: string;
  categoryId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (task: any) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  projectId,
  categoryId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    task_name: '',
    description: '',
    status: 'Todo',
    priority: 'High', 
    start_date: '',
    due_date: '',
    assignee_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sử dụng hook hiện có
  const { 
    project, 
    loading: projectLoading, 
    error: projectError 
  } = useProject(projectId);

  // Tạo danh sách tất cả người có thể được assign task
  const assignableUsers = useMemo(() => {
    if (!project) return [];
    
    const users = [];
    
    // Thêm manager
    if (project.manager) {
      users.push({
        user_id: project.manager.user_id,
        full_name: project.manager.full_name,
        position: project.manager.position || 'Manage',
        role_in_project: 'Manage',
        isManager: true,
        email: project.manager.email
      });
    }
    
    // Thêm các members
    if (project.members && project.members.length > 0) {
      project.members.forEach(member => {
        // Tránh duplicate nếu manager cũng là member
        if (member.user.user_id !== project.manager?.user_id) {
          users.push({
            user_id: member.user.user_id,
            full_name: member.user.full_name,
            position: member.user.position || 'Member',
            role_in_project: member.role_in_project,
            isManager: false,
            email: member.user.email
          });
        }
      });
    }
    
    return users;
  }, [project]);

  // Tạo options cho select dropdown
  const selectOptions = useMemo(() => {
    return assignableUsers.map(user => ({
      value: user.user_id,
      label: `${user.isManager ? '👑 ' : ''}${user.full_name} - ${user.position} (${user.role_in_project})`,
      user: user
    }));
  }, [assignableUsers]);

  // Lấy thông tin user được chọn
  const selectedUser = useMemo(() => {
    return assignableUsers.find(user => user.user_id === formData.assignee_id);
  }, [assignableUsers, formData.assignee_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const taskData = {
        ...formData,
      };

      const newTask = await createTask(projectId, categoryId, taskData);
      onSuccess(newTask);
      onClose();
      
      // Reset form
      setFormData({
        task_name: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        start_date: '',
        due_date: '',
        assignee_id: '',
      });
    } catch (err) {
      setError('Không thể tạo công việc. Vui lòng thử lại.');
      console.error('Error creating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form khi đóng modal
    setFormData({
      task_name: '',
      description: '',
      status: 'Todo',
      priority: 'High',
      start_date: '',
      due_date: '',
      assignee_id: '',
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const hasAssignableUsers = assignableUsers.length > 0;
  const totalMembers = assignableUsers.length;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Tạo công việc mới</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="task_name">Tên công việc *</label>
            <input
              type="text"
              id="task_name"
              name="task_name"
              value={formData.task_name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Nhập tên công việc..."
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              rows={4}
              placeholder="Mô tả chi tiết công việc..."
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="status">Trạng thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="Todo">Chưa làm</option>
                <option value="In Progress">Đang làm</option>
                <option value="Review">Đang xét duyệt</option>
                <option value="Done">Hoàn thành</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="priority">Mức độ ưu tiên</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="Low">Thấp</option>
                <option value="Medium">Trung bình</option>
                <option value="High">Cao</option>
                <option value="Urgent">Khẩn cấp</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="start_date">Ngày bắt đầu</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="due_date">Ngày kết thúc</label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          {/* Phần chọn người thực hiện */}
          <div className={styles.formGroup}>
            <label htmlFor="assignee_id">Người thực hiện *</label>
            {projectLoading ? (
              <div className={styles.loading}>
                <span className={styles.spinner}></span>
                Đang tải danh sách thành viên...
              </div>
            ) : projectError ? (
              <div className={styles.error}>
                ❌ {projectError}
              </div>
            ) : !hasAssignableUsers ? (
              <div className={styles.warning}>
                <div className={styles.warningIcon}>⚠️</div>
                <div>
                  <p><strong>Dự án chưa có thành viên nào!</strong></p>
                  <p>Vui lòng thêm thành viên vào dự án trước khi tạo task.</p>
                </div>
              </div>
            ) : (
              <>
                <select
                  id="assignee_id"
                  name="assignee_id"
                  value={formData.assignee_id}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="">-- Chọn người thực hiện --</option>
                  {selectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {/* Hiển thị thông tin người được chọn */}
                {selectedUser && (
                  <div className={styles.selectedUserInfo}>
                    <div className={styles.selectedUserHeader}>
                      <span className={styles.checkIcon}>✅</span>
                      <strong>{selectedUser.full_name}</strong>
                      {selectedUser.isManager && (
                        <span className={styles.managerBadge}>MANAGER</span>
                      )}
                    </div>
                    <div className={styles.selectedUserDetails}>
                      <span>📧 {selectedUser.email}</span>
                      <span>💼 {selectedUser.position}</span>
                      <span>🎯 {selectedUser.role_in_project}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Hiển thị thông tin dự án */}
          {project && (
            <div className={styles.projectInfo}>
              <div className={styles.projectHeader}>
                <div className={styles.projectTitle}>
                  <h3>📁 {project.project_name}</h3>
                  <span className={`${styles.statusBadge} ${styles[project.status?.toLowerCase().replace(/\s+/g, '_')] || ''}`}>
                    {project.status}
                  </span>
                </div>
              </div>
              <div className={styles.projectStats}>
                <div className={styles.stat}>
                  <span className={styles.statIcon}>👥</span>
                  <span>{totalMembers} thành viên</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statIcon}>📅</span>
                  <span>{project.start_date} → {project.end_date}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statIcon}>📊</span>
                  <span>{project.progress || 0}% hoàn thành</span>
                </div>
              </div>
              {project.manager && (
                <div className={styles.managerInfo}>
                  <span className={styles.statIcon}>👑</span>
                  <span>Quản lý: <strong>{project.manager.full_name}</strong></span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <span className={styles.errorIcon}>❌</span>
              {error}
            </div>
          )}

          <div className={styles.formActions}>
            <button 
              type="button" 
              onClick={handleClose} 
              className={styles.cancelButton}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading || !hasAssignableUsers || projectLoading} 
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Đang tạo...
                </>
              ) : (
                'Tạo công việc'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;