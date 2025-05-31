import React, { useState } from 'react';
import styles from './CreateTaskModal.module.css';
import { createTask } from '../../services/taskService';

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

      const newTask = await createTask(projectId,categoryId,taskData );
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

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Tạo công việc mới</h2>
          <button className={styles.closeButton} onClick={onClose}>
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

          <div className={styles.formGroup}>
            <label htmlFor="assignee_id">Người thực hiện (ID)</label>
            <input
              type="text"
              id="assignee_id"
              name="assignee_id"
              value={formData.assignee_id}
              onChange={handleChange}
              className={styles.input}
              placeholder="VD: user-1"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Hủy
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Đang tạo...' : 'Tạo công việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;