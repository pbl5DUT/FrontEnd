'use client';

import React, { useState } from 'react';
import styles from './ViewProject.module.css';
import {
  Project,
  ProjectTask,
  ProjectMember,
  ProjectFile,
  ProjectComment,
} from '../../types/project';

interface ViewProjectProps {
  project: Project;
  onClose: () => void;
}

const ViewProject: React.FC<ViewProjectProps> = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'members' | 'files' | 'comments'
  >('overview');

  if (!project) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className={styles.viewProject}>
      <div className={styles.header}>
        <h2>Chi tiết dự án: {project.project_name}</h2>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'overview' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Tổng quan
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'tasks' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('tasks')}
        >
          Công việc
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'members' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('members')}
        >
          Thành viên
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'files' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('files')}
        >
          Tệp đính kèm
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'comments' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('comments')}
        >
          Bình luận
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <div className={styles.overviewTab}>
            <div className={styles.projectInfo}>
              <div className={styles.infoSection}>
                <h3>Thông tin dự án</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Mã quản lý:</span>
                    <span className={styles.value}>{project.project_id}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Trạng thái:</span>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[
                          project.status.toLowerCase().replace(/\s+/g, '_')
                        ]
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Ngày bắt đầu:</span>
                    <span className={styles.value}>{project.start_date}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Ngày kết thúc:</span>
                    <span className={styles.value}>{project.end_date}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Quản lý:</span>
                    <span className={styles.value}>{project.manager}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Tiến độ:</span>
                    <div className={styles.progressContainer}>
                      <div
                        className={`${styles.progressBar} ${
                          (project.progress || 0) < 30
                            ? styles.low
                            : (project.progress || 0) < 70
                            ? styles.medium
                            : styles.high
                        }`}
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                      <span>{project.progress || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.descriptionSection}>
                <h3>Mô tả dự án</h3>
                <p className={styles.description}>{project.description}</p>
              </div>

              <div className={styles.statsSection}>
                <h3>Thống kê dự án</h3>
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>
                      {project.stats?.total_tasks || 0}
                    </div>
                    <div className={styles.statLabel}>Số lượng phân việc</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>
                      {project.stats?.completed_tasks || 0}
                    </div>
                    <div className={styles.statLabel}>Đóng</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>
                      {project.stats?.in_progress || 0}
                    </div>
                    <div className={styles.statLabel}>Đang thực hiện</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>
                      {project.stats?.pending_tasks || 0}
                    </div>
                    <div className={styles.statLabel}>Kiểm duyệt</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className={styles.tasksTab}>
            <div className={styles.tasksHeader}>
              <h3>Danh sách phân việc</h3>
              <button className={styles.addButton}>Thêm công việc</button>
            </div>

            {project.tasks && project.tasks.length > 0 ? (
              <table className={styles.tasksTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên công việc</th>
                    <th>Trạng thái</th>
                    <th>Người thực hiện</th>
                    <th>Hạn cuối</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {project.tasks.map((task: ProjectTask, index: number) => (
                    <tr key={task.task_id}>
                      <td>{index + 1}</td>
                      <td>{task.task_name}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[
                              task.status.toLowerCase().replace(/\s+/g, '_')
                            ]
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td>{task.assignee}</td>
                      <td>{task.due_date}</td>
                      <td className={styles.actions}>
                        <button
                          className={styles.viewButton}
                          title="Xem chi tiết"
                        >
                          <img
                            src="/assets/icons/list.png"
                            alt="Xem chi tiết"
                            className={styles.icon}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyState}>
                Chưa có phân việc nào. Hãy thêm công việc mới.
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className={styles.membersTab}>
            <div className={styles.membersHeader}>
              <h3>Thành viên dự án</h3>
              <button className={styles.addButton}>Thêm thành viên</button>
            </div>

            {project.members && project.members.length > 0 ? (
              <table className={styles.membersTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Thành viên</th>
                    <th>Vai trò</th>
                    <th>Email</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {project.members.map(
                    (member: ProjectMember, index: number) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className={styles.memberInfo}>
                          {member.user.avatar ? (
                            <img
                              src={member.user.avatar}
                              alt={member.user.full_name}
                              className={styles.memberAvatar}
                            />
                          ) : (
                            <div className={styles.avatarPlaceholder}>
                              {member.user.full_name.charAt(0)}
                            </div>
                          )}
                          <span>{member.user.full_name}</span>
                        </td>
                        <td>{member.role_in_project}</td>
                        <td>{member.user.email}</td>
                        <td className={styles.actions}>
                          <button className={styles.deleteButton} title="Xóa">
                            <img
                              src="/assets/icons/delete.png"
                              alt="Xóa"
                              className={styles.icon}
                            />
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyState}>
                Chưa có thành viên nào. Hãy thêm thành viên mới.
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className={styles.filesTab}>
            <div className={styles.filesHeader}>
              <h3>Tệp đính kèm</h3>
              <button className={styles.addButton}>Tải lên tệp</button>
            </div>

            {project.files && project.files.length > 0 ? (
              <div className={styles.filesList}>
                {project.files.map((file: ProjectFile, index: number) => (
                  <div key={index} className={styles.fileItem}>
                    <div className={styles.fileIcon}>
                      <img
                        src={`/assets/icons/${getFileIcon(file.type)}.png`}
                        alt={file.type}
                      />
                    </div>
                    <div className={styles.fileInfo}>
                      <div className={styles.fileName}>{file.name}</div>
                      <div className={styles.fileDetails}>
                        {file.size} • {file.uploaded_by} • {file.upload_date}
                      </div>
                    </div>
                    <div className={styles.fileActions}>
                      <button
                        className={styles.downloadButton}
                        title="Tải xuống"
                      >
                        <img
                          src="/assets/icons/download.png"
                          alt="Tải xuống"
                          className={styles.icon}
                        />
                      </button>
                      <button className={styles.deleteButton} title="Xóa">
                        <img
                          src="/assets/icons/delete.png"
                          alt="Xóa"
                          className={styles.icon}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                Chưa có tệp đính kèm nào. Hãy tải lên tệp mới.
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className={styles.commentsTab}>
            <h3>Bình luận</h3>

            <div className={styles.commentsList}>
              {project.comments && project.comments.length > 0 ? (
                project.comments.map(
                  (comment: ProjectComment, index: number) => (
                    <div key={index} className={styles.commentItem}>
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
                          <span className={styles.commentUserName}>
                            {comment.user.full_name}
                          </span>
                        </div>
                        <div className={styles.commentDate}>{comment.date}</div>
                      </div>
                      <div className={styles.commentContent}>
                        {comment.content}
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className={styles.emptyState}>
                  Chưa có bình luận nào. Hãy thêm bình luận mới.
                </div>
              )}
            </div>

            <div className={styles.addComment}>
              <textarea
                className={styles.commentInput}
                placeholder="Thêm bình luận..."
                rows={3}
              ></textarea>
              <button className={styles.commentButton}>Gửi</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to determine file icon based on file type
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

export default ViewProject;
