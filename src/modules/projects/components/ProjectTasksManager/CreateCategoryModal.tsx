
import React, { useState } from 'react';
import styles from './CreateCategoryModal.module.css';
import { createTaskCategory, updateTaskCategory, TaskCategory } from '../../services/taskService';

interface CreateCategoryModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (category: TaskCategory) => void;
  editCategory?: TaskCategory | null; // For editing mode
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onSuccess,
  editCategory,
}) => {
  const [formData, setFormData] = useState({
    name: editCategory?.name || '',
    description: editCategory?.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when editCategory changes
  React.useEffect(() => {
    if (editCategory) {
      setFormData({
        name: editCategory.name,
        description: editCategory.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [editCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      let category: TaskCategory;
      
      if (editCategory) {
        // Update existing category
        category = await updateTaskCategory(projectId, editCategory.id, formData);
      } else {
        // Create new category
        category = await createTaskCategory(projectId, formData);
      }

      onSuccess(category);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
      });
    } catch (err) {
      setError(editCategory ? 'Không thể cập nhật danh mục. Vui lòng thử lại.' : 'Không thể tạo danh mục. Vui lòng thử lại.');
      console.error('Error with category:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{editCategory ? 'Sửa danh mục' : 'Tạo danh mục mới'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Tên danh mục *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="VD: Thiết kế UX/UI"
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
              placeholder="Mô tả về danh mục này..."
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Hủy
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Đang xử lý...' : (editCategory ? 'Cập nhật' : 'Tạo danh mục')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryModal;