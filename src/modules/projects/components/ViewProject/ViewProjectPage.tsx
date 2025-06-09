
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Project } from '@/modules/projects/types/project';
import { fetchProjectById } from '@/modules/projects/services/project_service';
import styles from './ViewProjectPage.module.css';
import { MainLayout } from '@/layouts/Mainlayout';
import Link from 'next/link';
import ProjectTimeline from '../ProjectTimeline/ProjectTimeline';
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectInfo } from './components/ProjectInfo';
import { ProjectTabs } from './components/ProjectTabs';
import { OverviewTab, MembersTab, FilesTab, CommentsTab } from './components/tabs';
import ProjectTasksManager from '../ProjectTasksManager/ProjectTasksManager';

// ===== INTERFACES =====
export interface TaskAssignee {
  name: string | undefined;
  avatar: any;
  id: string | null | undefined;
  user_id: string;
  user: {
    id: string;
    full_name: string;
    avatar: string | null;
  };
  role: string;
  assigned_date: string;
}

export interface TaskComment {
  id: string;
  user_name: string;
  user: {
    id: string;
    full_name: string;
    avatar: string | null;
  };
  content: string;
  created_at: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  file_type: string;
  file_size: string;
  uploaded_by: string;
  upload_date: string;
  size: number;
}

export interface TaskCategory {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  tasks_count: number;
  completed_tasks_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  task_id: string;
  task_name: string;
  status: 'Todo' | 'In Progress' | 'Done' | 'Cancelled' | 'Review';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical' | 'Urgent';
  description?: string;
  start_date?: string;
  due_date?: string;
  actual_end_date?: string;
  progress?: number;
  created_at?: string;
  updated_at?: string;
  category_name?: string;
  assignee?: {
    user_id: string;
    full_name: string;
    email?: string;
    role?: string;
    department?: string;
    gender?: string;
    birth_date?: string;
    phone?: string;
    province?: string;
    district?: string;
    address?: string;
    position?: string;
    avatar?: string | null;
    created_at?: string;
    enterprise?: {
      enterprise_id: string;
      name: string;
      address: string;
      phone_number: string;
      email: string;
      industry: string;
      created_at: string;
      updated_at: string;
    };
  };
  assignees?: TaskAssignee[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
}

export interface TaskWithDetails extends Task {
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  assignees?: TaskAssignee[];
}

// ===== INTERFACES CHO TIMELINE =====
export interface CategoryData {
  id: string;
  name: string;
  project_id: string;
  tasks_count: number;
  completed_tasks_count: number;
}

export interface TaskData {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  start_date: string; // DD/MM/YYYY format
  due_date: string; // DD/MM/YYYY format
  status: 'Todo' | 'In Progress' | 'Done' | 'Cancelled' | 'Review';
  assignees: any[];
}

// ===== MOCK DATA =====
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
    name: 'Design & Planning',
    project_id: 'PRJ-24070810-4798',
    tasks_count: 6,
    completed_tasks_count: 4,
  },
  {
    id: 'cat-3',
    name: 'Development',
    project_id: 'PRJ-24070810-4798',
    tasks_count: 8,
    completed_tasks_count: 5,
  },
  {
    id: 'cat-4',
    name: 'Testing',
    project_id: 'PRJ-24070810-4798',
    tasks_count: 4,
    completed_tasks_count: 2,
  },
  {
    id: 'cat-5',
    name: 'Deployment',
    project_id: 'PRJ-24070810-4798',
    tasks_count: 3,
    completed_tasks_count: 1,
  }
];

const mockTasks: TaskData[] = [
  // Definition Category
  {
    id: 'task-1',
    name: 'Project definition',
    category_id: 'cat-1',
    category_name: 'Definition',
    start_date: '01/04/2020',
    due_date: '08/04/2020',
    status: 'Done',
    assignees: [
      { id: 'user-1', name: 'Nguyễn Văn An', role: 'Project Manager' }
    ],
  },
  {
    id: 'task-2',
    name: 'Requirements gathering',
    category_id: 'cat-1',
    category_name: 'Definition',
    start_date: '05/04/2020',
    due_date: '15/04/2020',
    status: 'Done',
    assignees: [
      { id: 'user-2', name: 'Trần Thị Bảo', role: 'Business Analyst' }
    ],
  },
  {
    id: 'task-3',
    name: 'Stakeholder interviews',
    category_id: 'cat-1',
    category_name: 'Definition',
    start_date: '10/04/2020',
    due_date: '20/04/2020',
    status: 'Done',
    assignees: [
      { id: 'user-3', name: 'Lê Minh Cường', role: 'Senior Analyst' }
    ],
  },
  {
    id: 'task-4',
    name: 'Project scope documentation',
    category_id: 'cat-1',
    category_name: 'Definition',
    start_date: '15/04/2020',
    due_date: '25/04/2020',
    status: 'In Progress',
    assignees: [
      { id: 'user-1', name: 'Nguyễn Văn An', role: 'Project Manager' }
    ],
  },
  {
    id: 'task-5',
    name: 'Risk assessment',
    category_id: 'cat-1',
    category_name: 'Definition',
    start_date: '20/04/2020',
    due_date: '30/04/2020',
    status: 'Todo',
    assignees: [
      { id: 'user-4', name: 'Phạm Thị Dung', role: 'Risk Manager' }
    ],
  },

  // Design & Planning Category
  {
    id: 'task-6',
    name: 'System architecture design',
    category_id: 'cat-2',
    category_name: 'Design & Planning',
    start_date: '25/04/2020',
    due_date: '10/05/2020',
    status: 'Done',
    assignees: [
      { id: 'user-5', name: 'Hoàng Văn Minh', role: 'Solution Architect' }
    ],
  },
  {
    id: 'task-7',
    name: 'Database design',
    category_id: 'cat-2',
    category_name: 'Design & Planning',
    start_date: '01/05/2020',
    due_date: '15/05/2020',
    status: 'Done',
    assignees: [
      { id: 'user-6', name: 'Vũ Thành Nam', role: 'Database Designer' }
    ],
  },
  {
    id: 'task-8',
    name: 'UI/UX wireframes',
    category_id: 'cat-2',
    category_name: 'Design & Planning',
    start_date: '05/05/2020',
    due_date: '20/05/2020',
    status: 'Done',
    assignees: [
      { id: 'user-7', name: 'Đỗ Thị Linh', role: 'UX Designer' }
    ],
  },
  {
    id: 'task-9',
    name: 'API documentation',
    category_id: 'cat-2',
    category_name: 'Design & Planning',
    start_date: '10/05/2020',
    due_date: '25/05/2020',
    status: 'Done',
    assignees: [
      { id: 'user-8', name: 'Ngô Văn Quang', role: 'Technical Writer' }
    ],
  },
  {
    id: 'task-10',
    name: 'Security planning',
    category_id: 'cat-2',
    category_name: 'Design & Planning',
    start_date: '15/05/2020',
    due_date: '30/05/2020',
    status: 'Review',
    assignees: [
      { id: 'user-9', name: 'Bùi Thị Hương', role: 'Security Specialist' }
    ],
  },
  {
    id: 'task-11',
    name: 'Performance requirements',
    category_id: 'cat-2',
    category_name: 'Design & Planning',
    start_date: '20/05/2020',
    due_date: '05/06/2020',
    status: 'In Progress',
    assignees: [
      { id: 'user-5', name: 'Hoàng Văn Minh', role: 'Solution Architect' }
    ],
  },

  // Development Category
  {
    id: 'task-12',
    name: 'Backend API development',
    category_id: 'cat-3',
    category_name: 'Development',
    start_date: '01/06/2020',
    due_date: '30/06/2020',
    status: 'Done',
    assignees: [
      { id: 'user-10', name: 'Cao Văn Đức', role: 'Backend Developer' },
      { id: 'user-11', name: 'Phan Thị Mai', role: 'Backend Developer' }
    ],
  },
  {
    id: 'task-13',
    name: 'Database implementation',
    category_id: 'cat-3',
    category_name: 'Development',
    start_date: '05/06/2020',
    due_date: '25/06/2020',
    status: 'Done',
    assignees: [
      { id: 'user-6', name: 'Vũ Thành Nam', role: 'Database Developer' }
    ],
  },
  {
    id: 'task-14',
    name: 'Frontend development',
    category_id: 'cat-3',
    category_name: 'Development',
    start_date: '15/06/2020',
    due_date: '15/07/2020',
    status: 'Done',
    assignees: [
      { id: 'user-12', name: 'Lý Văn Hoà', role: 'Frontend Developer' },
      { id: 'user-13', name: 'Đinh Thị Lan', role: 'Frontend Developer' }
    ],
  },
  {
    id: 'task-15',
    name: 'Authentication system',
    category_id: 'cat-3',
    category_name: 'Development',
    start_date: '20/06/2020',
    due_date: '10/07/2020',
    status: 'Done',
    assignees: [
      { id: 'user-10', name: 'Cao Văn Đức', role: 'Backend Developer' }
    ],
  },
  {
    id: 'task-16',
    name: 'Payment integration',
    category_id: 'cat-3',
    category_name: 'Development',
    start_date: '01/07/2020',
    due_date: '20/07/2020',
    status: 'Done',
    assignees: [
      { id: 'user-11', name: 'Phan Thị Mai', role: 'Backend Developer' }
    ],
  },
  {
    id: 'task-17',
    name: 'Mobile app development',
    category_id: 'cat-3',
    category_name: 'Development',
    start_date: '10/07/2020',
    due_date: '10/08/2020',
    status: 'In Progress',
    assignees: [
      { id: 'user-14', name: 'Võ Minh Tuấn', role: 'Mobile Developer' }
    ],
  },
  {
    id: 'task-18',
    name: 'Admin dashboard',
    category_id: 'cat-3',
    category_name: 'Development',
    start_date: '15/07/2020',
    due_date: '05/08/2020',
    status: 'In Progress',
    assignees: [
      { id: 'user-12', name: 'Lý Văn Hoà', role: 'Frontend Developer' }
    ],
  },

  // Testing Category
  {
    id: 'task-19',
    name: 'Unit testing',
    category_id: 'cat-4',
    category_name: 'Testing',
    start_date: '01/08/2020',
    due_date: '20/08/2020',
    status: 'Done',
    assignees: [
      { id: 'user-15', name: 'Tạ Văn Phúc', role: 'QA Engineer' }
    ],
  },
  {
    id: 'task-20',
    name: 'Integration testing',
    category_id: 'cat-4',
    category_name: 'Testing',
    start_date: '10/08/2020',
    due_date: '30/08/2020',
    status: 'Done',
    assignees: [
      { id: 'user-16', name: 'Lê Thị Thu', role: 'QA Engineer' }
    ],
  },
  {
    id: 'task-21',
    name: 'Performance testing',
    category_id: 'cat-4',
    category_name: 'Testing',
    start_date: '20/08/2020',
    due_date: '10/09/2020',
    status: 'In Progress',
    assignees: [
      { id: 'user-17', name: 'Nguyễn Văn Toàn', role: 'Performance Tester' }
    ],
  },
  {
    id: 'task-22',
    name: 'Security testing',
    category_id: 'cat-4',
    category_name: 'Testing',
    start_date: '25/08/2020',
    due_date: '15/09/2020',
    status: 'Todo',
    assignees: [
      { id: 'user-9', name: 'Bùi Thị Hương', role: 'Security Tester' }
    ],
  },

  // Deployment Category
  {
    id: 'task-23',
    name: 'Production environment setup',
    category_id: 'cat-5',
    category_name: 'Deployment',
    start_date: '01/09/2020',
    due_date: '15/09/2020',
    status: 'Done',
    assignees: [
      { id: 'user-18', name: 'Trương Văn Kiên', role: 'DevOps Engineer' }
    ],
  },
  {
    id: 'task-24',
    name: 'Application deployment',
    category_id: 'cat-5',
    category_name: 'Deployment',
    start_date: '10/09/2020',
    due_date: '25/09/2020',
    status: 'In Progress',
    assignees: [
      { id: 'user-18', name: 'Trương Văn Kiên', role: 'DevOps Engineer' },
      { id: 'user-19', name: 'Phạm Minh Khôi', role: 'System Admin' }
    ],
  },
  {
    id: 'task-25',
    name: 'Go-live and monitoring',
    category_id: 'cat-5',
    category_name: 'Deployment',
    start_date: '20/09/2020',
    due_date: '30/09/2020',
    status: 'Todo',
    assignees: [
      { id: 'user-1', name: 'Nguyễn Văn An', role: 'Project Manager' },
      { id: 'user-18', name: 'Trương Văn Kiên', role: 'DevOps Engineer' }
    ],
  }
];

const ViewProjectPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'members' | 'files' | 'comments'
  >('overview');
  const [showTimeline, setShowTimeline] = useState<boolean>(false);

  useEffect(() => {
    if (!router.isReady || !id) return;

    const getProject = async () => {
      try {
        setLoading(true);
        const projectData = await fetchProjectById(id as string);
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
        // await deleteProject(Number(id)); 
        router.push('/projects');
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Không thể xóa dự án. Vui lòng thử lại sau.');
      }
    }
  };

  const refreshData = () => {
    if (id) {
      fetchProjectById(id as string)
        .then(data => setProject(data))
        .catch(err => console.error('Error refreshing project data:', err));
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
        <ProjectHeader 
          project={project}
          onToggleTimeline={handleToggleTimeline}
          onDeleteProject={handleDeleteProject}
        />

        <ProjectInfo project={project} />

        <ProjectTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <OverviewTab project={project} />
          )}

          {activeTab === 'tasks' && (
            <div className={styles.tasksTab}>
              <ProjectTasksManager projectId={project.project_id} />
            </div>
          )}

          {activeTab === 'members' && (
            <MembersTab 
              project={project} 
              refreshData={refreshData}
            />
          )}

          {activeTab === 'files' && (
            <FilesTab 
              project={project} 
              refreshData={refreshData}
            />
          )}

          {activeTab === 'comments' && (
            <CommentsTab 
              project={project} 
              refreshData={refreshData}
            />
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

export default ViewProjectPage;




