import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './TaskDetail.module.css';

// Định nghĩa kiểu dữ liệu
interface TaskAssignee {
  user_id: string;
  user: {
    id: string;
    full_name: string;
    avatar: string | null;
  };
  role: string;
  assigned_date: string;
}

interface TaskComment {
  id: string;
  user: {
    id: string;
    full_name: string;
    avatar: string | null;
  };
  content: string;
  created_at: string;
}

interface TaskAttachment {
  id: string;
  name: string;
  file_type: string;
  file_size: string;
  uploaded_by: string;
  upload_date: string;
  url: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category_name: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  start_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  assignees: TaskAssignee[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
}

interface TaskDetailProps {
  projectId: string;
  categoryId: string;
  task: Task;
  onBack: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onAddComment: (taskId: string, comment: string) => void;
  onAddAssignee: (taskId: string) => void;
  onRemoveAssignee: (taskId: string, userId: string) => void;
  onUploadAttachment: (taskId: string, file: File) => void;
  onDeleteAttachment: (taskId: string, attachmentId: string) => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  projectId,
  categoryId,
  task,
  onBack,
  onUpdate,
  onDelete,
  onAddComment,
  onAddAssignee,
  onRemoveAssignee,
  onUploadAttachment,
  onDeleteAttachment,
}) => {
  const router = useRouter();
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'attachments'>(
    'comments'
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({
    name: task.name,
    description: task.description,
    status: task.status,
    priority: task.priority,
    start_date: task.start_date,
    due_date: task.due_date,
  });

  // Lấy màu cho priority badge
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return styles.priorityUrgent;
      case 'High':
        return styles.priorityHigh;
      case 'Medium':
        return styles.priorityMedium;
      case 'Low':
        return styles.priorityLow;
      default:
        return '';
    }
  };

  // Lấy màu cho status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo':
        return styles.statusTodo;
      case 'In Progress':
        return styles.statusInProgress;
      case 'Review':
        return styles.statusReview;
      case 'Done':
        return styles.statusDone;
      default:
        return '';
    }
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(task.id, newComment);
    setNewComment('');
  };

  const handleSaveEdit = () => {
    onUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTask({
      name: task.name,
      description: task.description,
      status: task.status,
      priority: task.priority,
      start_date: task.start_date,
      due_date: task.due_date,
    });
    setIsEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onUploadAttachment(task.id, file);
      e.target.value = ''; // Reset input
    }
  };

  // Lấy icon cho loại file
  const getFileIcon = (fileType: string): string => {
    const fileTypeMap: Record<string, string> = {
      pdf: 'pdf',
      doc: 'doc',
      docx: 'doc',
      xls: 'xls',
      xlsx: 'xls',
      ppt: 'ppt',
      pptx: 'ppt',
      txt: 'txt',
      zip: 'zip',
      rar: 'zip',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
    };

    return fileTypeMap[fileType.toLowerCase()] || 'file';
  };

  return (
    <div className={styles.taskDetailContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <img
            src="/assets/icons/back-arrow.png"
            alt="Quay lại"
            className={styles.backIcon}
          />
          Quay lại danh sách công việc
        </button>

        {!isEditing && (
          <div className={styles.actions}>
            <button
              className={styles.editButton}
              onClick={() => setIsEditing(true)}
            >
              <img
                src="/assets/icons/edit.png"
                alt="Sửa"
                className={styles.actionIcon}
              />
              Sửa
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa công việc này?')) {
                  onDelete(task.id);
                  onBack();
                }
              }}
            >
              <img
                src="/assets/icons/delete.png"
                alt="Xóa"
                className={styles.actionIcon}
              />
              Xóa
            </button>
          </div>
        )}

        {isEditing && (
          <div className={styles.actions}>
            <button className={styles.saveButton} onClick={handleSaveEdit}>
              <img
                src="/assets/icons/check.png"
                alt="Lưu"
                className={styles.actionIcon}
              />
              Lưu
            </button>
            <button className={styles.cancelButton} onClick={handleCancelEdit}>
              <img
                src="/assets/icons/close.png"
                alt="Hủy"
                className={styles.actionIcon}
              />
              Hủy
            </button>
          </div>
        )}
      </div>

      <div className={styles.taskContent}>
        <div className={styles.mainContent}>
          {isEditing ? (
            <div className={styles.editForm}>
              <div className={styles.formGroup}>
                <label>Tên công việc</label>
                <input
                  type="text"
                  value={editedTask.name}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, name: e.target.value })
                  }
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={editedTask.description}
                  onChange={(e) =>
                    setEditedTask({
                      ...editedTask,
                      description: e.target.value,
                    })
                  }
                  className={styles.formTextarea}
                  rows={5}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Trạng thái</label>
                  <select
                    value={editedTask.status}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        status: e.target.value as Task['status'],
                      })
                    }
                    className={styles.formSelect}
                  >
                    <option value="Todo">Chưa làm</option>
                    <option value="In Progress">Đang làm</option>
                    <option value="Review">Đang xét duyệt</option>
                    <option value="Done">Hoàn thành</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Mức độ ưu tiên</label>
                  <select
                    value={editedTask.priority}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        priority: e.target.value as Task['priority'],
                      })
                    }
                    className={styles.formSelect}
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
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={editedTask.start_date}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        start_date: e.target.value,
                      })
                    }
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    value={editedTask.due_date}
                    onChange={(e) =>
                      setEditedTask({ ...editedTask, due_date: e.target.value })
                    }
                    className={styles.formInput}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.taskHeader}>
                <h1 className={styles.taskName}>{task.name}</h1>
                <div className={styles.taskBadges}>
                  <span
                    className={`${styles.priorityBadge} ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>

              <div className={styles.categoryInfo}>
                <span className={styles.categoryLabel}>Danh mục:</span>
                <span className={styles.categoryName}>
                  {task.category_name}
                </span>
              </div>

              <div className={styles.taskDates}>
                <div className={styles.dateItem}>
                  <span className={styles.dateLabel}>Ngày bắt đầu:</span>
                  <span className={styles.dateValue}>{task.start_date}</span>
                </div>
                <div className={styles.dateItem}>
                  <span className={styles.dateLabel}>Ngày kết thúc:</span>
                  <span className={styles.dateValue}>{task.due_date}</span>
                </div>
              </div>

              <div className={styles.taskDescription}>
                <h3>Mô tả công việc</h3>
                <p>{task.description}</p>
              </div>
            </>
          )}

          <div className={styles.taskTabs}>
            <button
              className={`${styles.tabButton} ${
                activeTab === 'comments' ? styles.activeTab : ''
              }`}
              onClick={() => setActiveTab('comments')}
            >
              Bình luận ({task.comments.length})
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === 'attachments' ? styles.activeTab : ''
              }`}
              onClick={() => setActiveTab('attachments')}
            >
              Tệp đính kèm ({task.attachments.length})
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'comments' && (
              <div className={styles.commentsSection}>
                <div className={styles.newComment}>
                  <textarea
                    placeholder="Thêm bình luận..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className={styles.commentInput}
                    rows={3}
                  />
                  <button
                    className={styles.commentButton}
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                  >
                    Gửi
                  </button>
                </div>

                {task.comments.length > 0 ? (
                  <div className={styles.commentsList}>
                    {task.comments.map((comment) => (
                      <div key={comment.id} className={styles.commentItem}>
                        <div className={styles.commentHeader}>
                          <div className={styles.commentUser}>
                            {comment.user.avatar ? (
                              <img
                                src={comment.user.avatar}
                                alt={comment.user.full_name}
                                className={styles.commentAvatar}
                              />
                            ) : (
                              <div className={styles.avatarPlaceholder}>
                                {comment.user.full_name.charAt(0)}
                              </div>
                            )}
                            <span className={styles.userName}>
                              {comment.user.full_name}
                            </span>
                          </div>
                          <span className={styles.commentDate}>
                            {comment.created_at}
                          </span>
                        </div>
                        <div className={styles.commentContent}>
                          {comment.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyComments}>
                    <p>Chưa có bình luận nào. Hãy thêm bình luận đầu tiên.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'attachments' && (
              <div className={styles.attachmentsSection}>
                <div className={styles.uploadContainer}>
                  <label className={styles.uploadButton}>
                    <img
                      src="/assets/icons/upload.png"
                      alt="Upload"
                      className={styles.uploadIcon}
                    />
                    Tải lên tệp
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {task.attachments.length > 0 ? (
                  <div className={styles.attachmentsList}>
                    {task.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className={styles.attachmentItem}
                      >
                        <div className={styles.attachmentIcon}>
                          <img
                            src={`/assets/icons/${getFileIcon(
                              attachment.file_type
                            )}.png`}
                            alt={attachment.file_type}
                          />
                        </div>
                        <div className={styles.attachmentInfo}>
                          <div className={styles.attachmentName}>
                            {attachment.name}
                          </div>
                          <div className={styles.attachmentDetails}>
                            {attachment.file_size} • {attachment.uploaded_by} •{' '}
                            {attachment.upload_date}
                          </div>
                        </div>
                        <div className={styles.attachmentActions}>
                          <a
                            href={attachment.url}
                            download
                            className={styles.downloadButton}
                            title="Tải xuống"
                          >
                            <img
                              src="/assets/icons/download.png"
                              alt="Download"
                            />
                          </a>
                          <button
                            className={styles.deleteAttachmentButton}
                            title="Xóa"
                            onClick={() => {
                              if (
                                window.confirm('Bạn có chắc muốn xóa tệp này?')
                              ) {
                                onDeleteAttachment(task.id, attachment.id);
                              }
                            }}
                          >
                            <img src="/assets/icons/delete.png" alt="Delete" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyAttachments}>
                    <p>Chưa có tệp đính kèm nào. Hãy tải lên tệp đầu tiên.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h3>Người thực hiện</h3>
            <div className={styles.assigneesList}>
              {task.assignees.map((assignee) => (
                <div key={assignee.user_id} className={styles.assigneeItem}>
                  <div className={styles.assigneeInfo}>
                    {assignee.user.avatar ? (
                      <img
                        src={assignee.user.avatar}
                        alt={assignee.user.full_name}
                        className={styles.assigneeAvatar}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {assignee.user.full_name.charAt(0)}
                      </div>
                    )}
                    <div className={styles.assigneeDetails}>
                      <div className={styles.assigneeName}>
                        {assignee.user.full_name}
                      </div>
                      <div className={styles.assigneeRole}>{assignee.role}</div>
                    </div>
                  </div>
                  <button
                    className={styles.removeAssigneeButton}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Bạn có chắc muốn xóa ${assignee.user.full_name} khỏi công việc này?`
                        )
                      ) {
                        onRemoveAssignee(task.id, assignee.user_id);
                      }
                    }}
                  >
                    <img src="/assets/icons/close.png" alt="Remove" />
                  </button>
                </div>
              ))}

              <button
                className={styles.addAssigneeButton}
                onClick={() => onAddAssignee(task.id)}
              >
                <img
                  src="/assets/icons/plus.png"
                  alt="Add"
                  className={styles.addIcon}
                />
                Thêm người thực hiện
              </button>
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <h3>Thông tin</h3>
            <div className={styles.taskInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Đã tạo:</span>
                <span className={styles.infoValue}>{task.created_at}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Cập nhật:</span>
                <span className={styles.infoValue}>{task.updated_at}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
