import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Project } from '@/modules/projects/types/project';
import { fetchProjectById } from '@/modules/projects/services/project_service';
import styles from './ViewProjectPage.module.css';
import { MainLayout } from '@/layouts/Mainlayout';
import Link from 'next/link';
import ProjectTasksManager from '../ProjectTasksManager/ProjectTasksManager';
import ProjectTimeline from '../ProjectTimeline/ProjectTimeline';

// Các interface đại diện cho dữ liệu task và category
interface TaskData {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  start_date: string;
  due_date: string;
  status: string;
  assignees: any[];
}

interface CategoryData {
  id: string;
  name: string;
  project_id: string;
  tasks_count: number;
  completed_tasks_count: number;
}

// Tạm thời vẫn giữ lại mock data cho categories và tasks cho đến khi
// API endpoint cho những dữ liệu này được phát triển
const mockCategories: CategoryData[] = [
  {
    id: 'cat-1',
    name: 'Definition',
    project_id: 'PRJ-24070810-4798',
    tasks_count: 5,
    completed_tasks_count: 3,
  },
  // ... các categories khác
];

const mockTasks: TaskData[] = [
  // Definition
  {
    id: 'task-1',
    name: 'Project definition',
    category_id: 'cat-1',
    category_name: 'Definition',
    start_date: '01/04/2020',
    due_date: '08/04/2020',
    status: 'Done',
    assignees: [],
  },
  // ... các tasks khác
];

const ViewProjectPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Lấy id từ router.query

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'members' | 'files' | 'comments'
  >('overview');
  const [showTimeline, setShowTimeline] = useState<boolean>(false);

  useEffect(() => {
    // Chỉ gọi API khi id đã được tải (router.isReady)
    if (!router.isReady || !id) return;

    const getProject = async () => {
      try {
        setLoading(true);
        
        // Gọi API để lấy thông tin dự án
        const projectData = await fetchProjectById(Number(id));
        
        setProject(projectData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Không thể tải dữ liệu dự án. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    getProject();
  }, [router.isReady, id]);

  const handleToggleTimeline = () => {
    setShowTimeline(!showTimeline);
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Bạn có chắc muốn xóa dự án này?')) {
      try {
        // Thực hiện gọi API xóa dự án
        // await deleteProject(Number(id)); 
        
        // Cần import hàm deleteProject từ service
        
        // Chuyển hướng về trang danh sách dự án sau khi xóa thành công
        router.push('/projects');
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Không thể xóa dự án. Vui lòng thử lại sau.');
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Đang tải dữ liệu...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className={styles.errorContainer}>
          <div className={styles.error}>{error}</div>
          <Link href="/projects" className={styles.backLink}>
            Quay lại danh sách dự án
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className={styles.errorContainer}>
          <div className={styles.error}>Không tìm thấy dự án</div>
          <Link href="/projects" className={styles.backLink}>
            Quay lại danh sách dự án
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.viewProjectPage}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link href="/projects" className={styles.backButton}>
              <img
                src="/assets/icons/back-arrow.png"
                alt="Quay lại"
                className={styles.backIcon}
              />
              Quay lại
            </Link>
            <h1>{project.project_name}</h1>
          </div>
          <div className={styles.headerRight}>
            {/* Thêm nút Timeline */}
            <button
              className={styles.timelineButton}
              onClick={handleToggleTimeline}
              title="Xem lịch trình"
            >
              <img
                src="/assets/icons/timeline.png"
                alt="Timeline"
                className={styles.actionIcon}
              />
              Lịch trình
            </button>

            <button 
              className={styles.editButton}
              onClick={() => router.push(`/projects/edit/${project.project_id}`)}
            >
              <img
                src="/assets/icons/edit.png"
                alt="Chỉnh sửa"
                className={styles.actionIcon}
              />
              Chỉnh sửa
            </button>
            <button
              className={styles.deleteButton}
              onClick={handleDeleteProject}
            >
              <img
                src="/assets/icons/delete.png"
                alt="Xóa"
                className={styles.actionIcon}
              />
              Xóa
            </button>
          </div>
        </div>

        <div className={styles.projectInfo}>
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Trạng thái</span>
            </div>
            <div className={styles.cardContent}>
              <span
                className={`${styles.statusBadge} ${
                  styles[project.status.toLowerCase().replace(/\s+/g, '_')]
                }`}
              >
                {project.status}
              </span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Ngày</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.dateInfo}>
                <div>
                  <span className={styles.dateLabel}>Bắt đầu:</span>
                  <span className={styles.dateValue}>{project.start_date}</span>
                </div>
                <div>
                  <span className={styles.dateLabel}>Kết thúc:</span>
                  <span className={styles.dateValue}>{project.end_date}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Quản lý</span>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.managerName}>{project.manager}</span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Tiến độ</span>
            </div>
            <div className={styles.cardContent}>
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
                <span className={styles.progressText}>
                  {project.progress || 0}%
                </span>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Mã dự án</span>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.projectId}>{project.project_id}</span>
            </div>
          </div>
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
              <div className={styles.descriptionSection}>
                <h3>Mô tả dự án</h3>
                <p className={styles.description}>{project.description || 'Không có mô tả'}</p>
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
          )}

          {activeTab === 'tasks' && (
            <div className={styles.tasksTab}>
              {/* Tích hợp ProjectTasksManager */}
              <ProjectTasksManager projectId={project.project_id} />
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
                    {project.members.map((member, index) => (
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
                          <button 
                            className={styles.deleteButton} 
                            title="Xóa"
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc muốn xóa ${member.user.full_name} khỏi dự án?`)) {
                                // Gọi API xóa thành viên
                                // Cần import removeProjectMember từ service
                                // removeProjectMember(Number(project.project_id), Number(member.user.id))
                                //  .then(() => refreshData())
                                //  .catch(err => console.error('Error removing member:', err));
                              }
                            }}
                          >
                            <img
                              src="/assets/icons/delete.png"
                              alt="Xóa"
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
                  {project.files.map((file, index) => (
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
                          onClick={() => {
                            // Xử lý tải xuống file
                            window.open(file.url, '_blank');
                          }}
                        >
                          <img
                            src="/assets/icons/download.png"
                            alt="Tải xuống"
                            className={styles.icon}
                          />
                        </button>
                        <button 
                          className={styles.deleteButton} 
                          title="Xóa"
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc muốn xóa tệp ${file.name}?`)) {
                              // Gọi API xóa file
                              // Cần implement API xóa file
                            }
                          }}
                        >
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
                  project.comments.map((comment, index) => (
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
                  ))
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
                <button 
                  className={styles.commentButton}
                  onClick={() => {
                    // Xử lý thêm bình luận
                    // Cần implement API thêm bình luận
                  }}
                >
                  Gửi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Component Timeline */}
      {showTimeline && (
        <ProjectTimeline
          projectId={project.project_id}
          projectStartDate={project.start_date}
          projectEndDate={project.end_date}
          categories={mockCategories}
          tasks={mockTasks}
          onClose={handleToggleTimeline}
        />
      )}
    </MainLayout>
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

export default ViewProjectPage;