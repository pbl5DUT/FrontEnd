// modules/stacks/components/TaskCard.tsx
import React from 'react';
import { useDrag } from 'react-dnd';

import styles from '../styles/Stacks.module.css';
import { Task, TaskPriority } from '../types/stacks';


interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'Thấp';
      case TaskPriority.MEDIUM:
        return 'Trung bình';
      case TaskPriority.HIGH:
        return 'Cao';
      case TaskPriority.CRITICAL:
        return 'Nghiêm trọng';
      case TaskPriority.URGENT:
        return 'Khẩn cấp';
      default:
        return 'Không xác định';
    }
  };
  

  // Setup React DnD drag source
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.task_id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Định dạng ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Hiển thị tối đa 3 người, nếu nhiều hơn thì hiển thị +n
  const renderAssignees = () => {
    const maxVisible = 3;
    const visibleAssignees = task.assignees?.slice(0, maxVisible);
    const remainingCount = (task.assignees?.length ?? 0) - maxVisible;

    return (
      <div className={styles.assigneesList}>
        {visibleAssignees?.map((assignee) => (
          <div
            key={assignee.id}
            className={styles.assigneeAvatar}
            title={assignee.name}
          >
            {(assignee.avatar || assignee?.name?.charAt(0)) ?? ''}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className={styles.assigneeMore}>+{remainingCount}</div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={(node) => {
        if (node) drag(node); // Ensure no return value
      }}
      className={`${styles.taskCard} ${isDragging ? styles.isDragging : ''}`}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className={styles.cardHeader}>
        <span className={styles.projectBadge}>{task.project_info?.project_name}</span>
        {task.attachments && task.attachments.length > 0 && (
          <span className={styles.attachmentIcon} title="Có tệp đính kèm">
            📎
          </span>
        )}
      </div>
      <h4 className={styles.taskTitle}>{task.task_name}</h4>
      <p className={styles.taskDescription}>{task.description}</p>
      <div className={styles.cardFooter}>
        <div
          className={`${styles.priorityBadge} ${
            styles[`priority${task.priority}`]
          }`}
        >
          {getPriorityLabel((task.priority as TaskPriority) ?? TaskPriority.LOW)}
        </div>
        <div className={styles.dateInfo} title="Ngày hết hạn">
          {formatDate(task?.due_date || '')}
        </div>
      </div>
      <div className={styles.cardAssignees}>{renderAssignees()}</div>
    </div>
  );
};

export default TaskCard;
