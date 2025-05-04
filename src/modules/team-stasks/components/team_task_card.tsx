// modules/stacks/components/TeamTaskCard.tsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { Task, TaskPriority } from '../types/teamStasks';
import styles from '../styles/TeamTasks.module.css';

interface TeamTaskCardProps {
  task: Task;
  onClick: () => void;
}

const TeamTaskCard: React.FC<TeamTaskCardProps> = ({ task, onClick }) => {
  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'Thấp';
      case TaskPriority.MEDIUM:
        return 'Trung bình';
      case TaskPriority.HIGH:
        return 'Cao';
    }
  };

  // Setup React DnD drag source
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const dragRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (dragRef.current) {
      drag(dragRef);
    }
  }, [drag]);

  // Định dạng ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Hiển thị tối đa 3 người, nếu nhiều hơn thì hiển thị +n
  const renderAssignees = () => {
    const maxVisible = 3;
    const visibleAssignees = task.assignees.slice(0, maxVisible);
    const remainingCount = task.assignees.length - maxVisible;

    return (
      <div className={styles.assigneesList}>
        {visibleAssignees.map((assignee) => (
          <div
            key={assignee.id}
            className={styles.assigneeAvatar}
            title={assignee.name}
          >
            {assignee.avatar || assignee.name.charAt(0)}
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
      ref={dragRef}
      className={`${styles.taskCard} ${isDragging ? styles.isDragging : ''}`}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className={styles.cardHeader}>
        <span className={styles.projectBadge}>{task.projectName}</span>
        {task.attachments && task.attachments.length > 0 && (
          <span className={styles.attachmentIcon} title="Có tệp đính kèm">
            📎
          </span>
        )}
      </div>
      <h4 className={styles.taskTitle}>{task.title}</h4>
      <p className={styles.taskDescription}>{task.description}</p>
      <div className={styles.cardFooter}>
        <div
          className={`${styles.priorityBadge} ${
            styles[`priority${task.priority}`]
          }`}
        >
          {getPriorityLabel(task.priority)}
        </div>
        <div className={styles.dateInfo} title="Ngày hết hạn">
          {formatDate(task.dueDate)}
        </div>
      </div>
      <div className={styles.cardAssignees}>
        {renderAssignees()}
        {task.comments && task.comments.length > 0 && (
          <div className={styles.commentCount} title="Bình luận">
            💬 {task.comments.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamTaskCard;
