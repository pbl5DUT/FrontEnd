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

// Mock data cho demo - sẽ được lấy từ API trong thực tế
const mockCategories: CategoryData[] = [
  {
    id: 'cat-1',
    name: 'Definition',
    project_id: 'PRJ-24070810-4798',
    tasks_count: 5,
    completed_tasks_count: 3,
  },
  {
    id: 'cat-2',
    name: 'Sales',
    project_id: 'PRJ-24070810-4798',
    tasks_count: 4,
    completed_tasks_count: 2,
  },
  {
    id: 'cat-3',
    name: 'Documentation',
    project_id: 'PRJ-24070810-4798',
    tasks_count: 5,
    completed_tasks_count: 2,
  },
  {
    id: 'cat-4',
    name: 'Features',
    project_id: 'PRJ-24070810-4798',
    tasks_count: 6,
    completed_tasks_count: 3,
  },
  {
    id: 'cat-5',
    name: 'Content',
    project_id: 'PRJ-24070810-4798',
    tasks_count: 3,
    completed_tasks_count: 1,
  },
];

// Mock data cho tasks dựa trên hình ảnh Gantt chart
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
  {
    id: 'task-2',
    name: 'Conceptualizing',
    category_id: 'cat-1',
    category_name: 'Definition',
    start_date: '08/04/2020',
    due_date: '15/04/2020',
    status: 'Done',
    assignees: [],
  },
  {
    id: 'task-3',
    name: 'Define goals and purpose',
    category_id: 'cat-1',
    category_name: 'Definition',
    start_date: '08/04/2020',
    due_date: '12/04/2020',
    status: 'Done',
    assignees: [],
  },
  {
    id: 'task-4',
    name: 'Budget definition',
    category_id: 'cat-1',
    category_name: 'Definition',
    start_date: '10/04/2020',
    due_date: '14/04/2020',
    status: 'Done',
    assignees: [],
  },
  {
    id: 'task-5',
    name: 'Revision',
    category_id: 'cat-1',
    category_name: 'Definition',
    start_date: '14/04/2020',
    due_date: '16/04/2020',
    status: 'Done',
    assignees: [],
  },
  {
    id: 'task-6',
    name: 'Resource mapping',
    category_id: 'cat-1',
    category_name: 'Definition',
    start_date: '16/04/2020',
    due_date: '19/04/2020',
    status: 'Done',
    assignees: [],
  },
  {
    id: 'task-7',
    name: "Collect client's vision and goals",
    category_id: 'cat-1',
    category_name: 'Definition',
    start_date: '18/04/2020',
    due_date: '23/04/2020',
    status: 'Done',
    assignees: [],
  },

  // Sales
  {
    id: 'task-8',
    name: 'Define required skills',
    category_id: 'cat-2',
    category_name: 'Sales',
    start_date: '21/04/2020',
    due_date: '26/04/2020',
    status: 'Done',
    assignees: [],
  },
  {
    id: 'task-9',
    name: 'Setup team',
    category_id: 'cat-2',
    category_name: 'Sales',
    start_date: '23/04/2020',
    due_date: '28/04/2020',
    status: 'Done',
    assignees: [],
  },
  {
    id: 'task-10',
    name: 'Inform team about their roles and goals',
    category_id: 'cat-2',
    category_name: 'Sales',
    start_date: '25/04/2020',
    due_date: '01/05/2020',
    status: 'Done',
    assignees: [],
  },
  {
    id: 'task-11',
    name: 'Specify milestones',
    category_id: 'cat-2',
    category_name: 'Sales',
    start_date: '26/04/2020',
    due_date: '02/05/2020',
    status: 'In Progress',
    assignees: [],
  },
  {
    id: 'task-12',
    name: 'Team kick-off meeting',
    category_id: 'cat-2',
    category_name: 'Sales',
    start_date: '01/05/2020',
    due_date: '03/05/2020',
    status: 'Todo',
    assignees: [],
  },

  // Documentation
  {
    id: 'task-13',
    name: 'Research competitors',
    category_id: 'cat-3',
    category_name: 'Documentation',
    start_date: '02/05/2020',
    due_date: '07/05/2020',
    status: 'Todo',
    assignees: [],
  },
  {
    id: 'task-14',
    name: 'Meeting with client',
    category_id: 'cat-3',
    category_name: 'Documentation',
    start_date: '04/05/2020',
    due_date: '06/05/2020',
    status: 'Todo',
    assignees: [],
  },
  {
    id: 'task-15',
    name: 'Request moodboard',
    category_id: 'cat-3',
    category_name: 'Documentation',
    start_date: '06/05/2020',
    due_date: '09/05/2020',
    status: 'Todo',
    assignees: [],
  },
  {
    id: 'task-16',
    name: 'Define requirements and expectations',
    category_id: 'cat-3',
    category_name: 'Documentation',
    start_date: '06/05/2020',
    due_date: '10/05/2020',
    status: 'Todo',
    assignees: [],
  },

  // Features
  {
    id: 'task-17',
    name: 'Features',
    category_id: 'cat-4',
    category_name: 'Features',
    start_date: '09/05/2020',
    due_date: '15/05/2020',
    status: 'Todo',
    assignees: [],
  },
  {
    id: 'task-18',
    name: 'Functionalities',
    category_id: 'cat-4',
    category_name: 'Features',
    start_date: '12/05/2020',
    due_date: '18/05/2020',
    status: 'Todo',
    assignees: [],
  },
  {
    id: 'task-19',
    name: "Map out user's journey",
    category_id: 'cat-4',
    category_name: 'Features',
    start_date: '14/05/2020',
    due_date: '20/05/2020',
    status: 'Todo',
    assignees: [],
  },
  {
    id: 'task-20',
    name: "Map out buyer's journey",
    category_id: 'cat-4',
    category_name: 'Features',
    start_date: '18/05/2020',
    due_date: '24/05/2020',
    status: 'Todo',
    assignees: [],
  },

  // Content
  {
    id: 'task-21',
    name: 'Meeting with client to understand voice',
    category_id: 'cat-5',
    category_name: 'Content',
    start_date: '20/05/2020',
    due_date: '25/05/2020',
    status: 'Todo',
    assignees: [],
  },
  {
    id: 'task-22',
    name: 'Content definition',
    category_id: 'cat-5',
    category_name: 'Content',
    start_date: '22/05/2020',
    due_date: '29/05/2020',
    status: 'Todo',
    assignees: [],
  },
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
    if (!router.isReady) return;

    const getProject = async () => {
      try {
        setLoading(true);

        // Sử dụng mock data tạm thời
        // Khi API sẵn sàng, bỏ comment dòng gọi fetchProjectById và xóa mockProject
        // const projectData = await fetchProjectById(id as string);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Giả lập delay mạng

        // Mock data cho testing
        const mockProject: Project = {
          project_id: 'PRJ-24070810-4798',
          project_name: 'Website Design Project Plan',
          description:
            'Phát triển và thiết kế website cho khách hàng, bao gồm: thiết kế UI/UX, xây dựng các tính năng chính và tối ưu hóa.',
          start_date: '01/04/2020',
          end_date: '31/05/2020',
          status: 'In Progress',
          progress: 42,
          manager: 'Hoàng Nguyễn Vũ',
          members: [
            {
              user: {
                id: '1',
                username: 'vu.hoang',
                full_name: 'Hoàng Nguyễn Vũ',
                email: 'vu.hoang@example.com',
                avatar: null,
              },
              role_in_project: 'Người tạo',
            },
            {
              user: {
                id: '2',
                username: 'huong.hoang',
                full_name: 'Hoàng Ngọc Thiên Hương',
                email: 'huong.hoang@example.com',
                avatar: null,
              },
              role_in_project: 'Giám sát',
            },
          ],
          stats: {
            total_tasks: 22,
            completed_tasks: 11,
            in_progress: 2,
            pending_tasks: 9,
            delayed_tasks: 0,
          },
          created_at: '25/03/2020',
          updated_at: '01/05/2020',
        };

        // setProject(projectData); // Khi dùng API thật
        setProject(mockProject); // Khi dùng mock data
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

            <button className={styles.editButton}>
              <img
                src="/assets/icons/edit.png"
                alt="Chỉnh sửa"
                className={styles.actionIcon}
              />
              Chỉnh sửa
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa dự án này?')) {
                  // Delete and redirect
                  router.push('/projects');
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
                          <button className={styles.deleteButton} title="Xóa">
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
                <button className={styles.commentButton}>Gửi</button>
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
