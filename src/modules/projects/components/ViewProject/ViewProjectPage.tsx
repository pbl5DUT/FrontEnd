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