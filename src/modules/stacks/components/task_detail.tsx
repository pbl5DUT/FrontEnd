// modules/stacks/components/TaskDetail.tsx
import React, { useState, useEffect } from 'react';
import stacksService from '../services/tasks_services_mock';
import { Task, TaskStatus, TaskAssignee, TaskComment } from '../types/task';
import styles from '../styles/Stacks.module.css';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onTaskUpdated: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  onClose,
  onTaskUpdated,
}) => {
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [availableUsers, setAvailableUsers] = useState<TaskAssignee[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Load danh sách người dùng có thể thêm vào task
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const users = await stacksService.getAllUsers();
        // Lọc ra những người chưa tham gia task
        const filteredUsers = users.filter(
          (user) => !(task.assignees ?? []).some((assignee) => assignee.id === user.id)
        );
        setAvailableUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [task]);

  const handleStatusChange = async () => {
    if (status === task.status) return;

    try {
      setIsUpdating(true);
      await stacksService.updateTaskStatus(task.task_id, status);
      onTaskUpdated();
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      // Giả định userId là user1 (người dùng hiện tại)
      const userId = 'user1';
      const user =
        (task.assignees ?? []).find((a) => a.id === userId) ||
        (await stacksService.getAllUsers()).find((u) => u.id === userId);

      if (!user) return;

      // await stacksService.addComment(task.task_id, {
      //   userId: user.id,
      //   userName: user.name,
      //   userAvatar: user.avatar,
      //   content: commentText,
      // });

      setCommentText('');
      onTaskUpdated();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddAssignee = async (assigneeId: string) => {
    try {
      await stacksService.addAssignee(task.task_id, assigneeId);
      onTaskUpdated();
    } catch (error) {
      console.error('Error adding assignee:', error);
    }
  };

  const handleRemoveAssignee = async (assigneeId: string) => {
    try {
      await stacksService.removeAssignee(task.task_id, assigneeId);
      onTaskUpdated();
    } catch (error) {
      console.error('Error removing assignee:', error);
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'Todo';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.DONE:
        return 'Done';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className={styles.detailHeader}>
        <h2 className={styles.detailTitle}>{task.task_name}</h2>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>

      <div className={styles.detailContent}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Mô tả công việc</h3>
          <p className={styles.taskDescription}>{task.description}</p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Thông tin chi tiết</h3>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Dự án:</span>
              <span className={styles.detailValue}>{task.project_info?.project_name}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Ngày tạo:</span>
              <span className={styles.detailValue}>
                {/* {formatDate(task.created_at)} */}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Độ ưu tiên:</span>
              <span
                className={`${styles.detailValue} ${
                  styles[`priority${task.priority}`]
                }`}
              >
                {/* {task.priority === 'LOW'
                  ? 'Thấp'
                  : task.priority === 'MEDIUM'
                  ? 'Trung bình'
                  : 'Cao'} */}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Ngày hết hạn:</span>
              <span className={styles.detailValue}>
                {task.due_date ? formatDate(task.due_date) : 'Không có ngày hết hạn'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Người tham gia</h3>
          <div className={styles.assigneesContainer}>
            {(task.assignees ?? []).map((assignee) => (
              <div key={assignee.id} className={styles.assigneeItem}>
                <div className={styles.assigneeInfo}>
                  <div className={styles.assigneeAvatar}>
                    {(assignee.avatar || assignee.name?.charAt(0)) ?? ''}
                  </div>
                  <span className={styles.assigneeName}>{assignee.name}</span>
                </div>
                <button
                  className={styles.removeAssigneeBtn}
                  onClick={() => handleRemoveAssignee(assignee.id ?? '')}
                  title="Xóa khỏi task"
                >
                  ×
                </button>
              </div>
            ))}

            <div className={styles.addAssigneeContainer}>
              <select
                className={styles.addAssigneeSelect}
                disabled={isLoadingUsers || availableUsers.length === 0}
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddAssignee(e.target.value);
                    e.target.value = ''; // Reset select sau khi chọn
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  {isLoadingUsers
                    ? 'Đang tải...'
                    : availableUsers.length === 0
                    ? 'Không có người dùng khả dụng'
                    : 'Thêm người tham gia'}
                </option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id ?? ''}>
                    {user.name}
                  </option>
                ))}
              </select>
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

        {task.attachments && task.attachments.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Tệp đính kèm</h3>
            <div className={styles.attachmentsList}>
              {task.attachments.map((attachment) => (
                <div key={attachment.id} className={styles.attachmentItem}>
                  <div className={styles.attachmentIcon}>📎</div>
                  <div className={styles.attachmentInfo}>
                    <div className={styles.attachmentName}>
                      {attachment.name}
                    </div>
                    <div className={styles.attachmentMeta}>
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB •{' '}
                      {attachment.uploadedAt ? formatDate(attachment.uploadedAt) : 'Không có ngày tải lên'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Bình luận</h3>
          <div className={styles.commentsContainer}>
            {task.comments && task.comments.length > 0 ? (
              <div className={styles.commentsList}>
                {task.comments.map((comment) => (
                  <div key={comment.id} className={styles.commentItem}>
                    <div className={styles.commentHeader}>
                      <div className={styles.commentUser}>
                        <div className={styles.commentAvatar}>
                          {comment.userAvatar || comment.userName.charAt(0)}
                        </div>
                        <span className={styles.commentUserName}>
                          {comment.userName}
                        </span>
                      </div>
                      <div className={styles.commentDate}>
                        {comment.createdAt ? formatDate(comment.createdAt) : 'Không có ngày tạo'}
                      </div>
                    </div>
                    <div className={styles.commentContent}>
                      {comment.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noComments}>Chưa có bình luận nào.</div>
            )}

            <div className={styles.addCommentContainer}>
              <textarea
                className={styles.commentInput}
                placeholder="Thêm bình luận..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
              />
              <button
                className={styles.commentButton}
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskDetail;
