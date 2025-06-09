// modules/stacks/components/DocumentViewer.tsx
import React, { useState } from 'react';
import stacksService from '../services/tasks_services_mock';
import { Task, TaskStatus } from '../types/task';
import styles from '../styles/Stacks.module.css';

interface TaskViewerProps {
  task: Task;
  onClose: () => void;
  onTaskUpdated: () => void;
}

const DocumentViewer: React.FC<TaskViewerProps> = ({
  task,
  onClose,
  onTaskUpdated,
}) => {
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async () => {
    if (status === task.status) return;

    try {
      setIsUpdating(true);
      await stacksService.updateTaskStatus(task.id, status);
      onTaskUpdated();
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'Cần làm';
      case TaskStatus.IN_PROGRESS:
        return 'Đang thực hiện';
      case TaskStatus.DONE:
        return 'Hoàn thành';
    }
  };

  const getPriorityLabel = (priority: any) => {
    switch (priority) {
      case 'LOW':
        return 'Thấp';
      case 'MEDIUM':
        return 'Trung bình';
      case 'HIGH':
        return 'Cao';
      default:
        return priority;
    }
  };

  return (
    <div className={styles.documentViewer}>
      <div className={styles.viewerHeader}>
        <h2 className={styles.viewerTitle}>{task.title}</h2>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>

      <div className={styles.viewerContent}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Mô tả công việc</h3>
          <p className={styles.taskDescription}>{task.description}</p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Thông tin chi tiết</h3>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Dự án:</span>
              <span className={styles.detailValue}>{task.projectName}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Độ ưu tiên:</span>
              <span
                className={`${styles.detailValue} ${
                  styles[`priority${task.priority}`]
                }`}
              >
                {getPriorityLabel(task.priority)}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Ngày hết hạn:</span>
              <span className={styles.detailValue}>
                {new Date(task.dueDate).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Cập nhật trạng thái</h3>
          <div className={styles.statusUpdate}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className={styles.statusSelect}
              disabled={isUpdating}
            >
              <option value={TaskStatus.TODO}>
                {getStatusLabel(TaskStatus.TODO)}
              </option>
              <option value={TaskStatus.IN_PROGRESS}>
                {getStatusLabel(TaskStatus.IN_PROGRESS)}
              </option>
              <option value={TaskStatus.DONE}>
                {getStatusLabel(TaskStatus.DONE)}
              </option>
            </select>

            <button
              className={styles.updateButton}
              onClick={handleStatusChange}
              disabled={status === task.status || isUpdating}
            >
              {isUpdating ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
