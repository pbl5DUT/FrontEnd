import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/layouts/Mainlayout';
import ProjectTimeline from '@/modules/projects/components/ProjectTimeline/ProjectTimeline';
import { fetchProjectById } from '@/modules/projects/services/project_service';
import { Project } from '@/modules/projects/types/project';
import { TaskData, CategoryData } from '@/modules/projects/components/ProjectTimeline/ProjectTimeline';
import Link from 'next/link';

// 🎨 Constants cho styling
const STYLES = {
  container: {
    padding: '20px',
    paddingLeft: '260px', // 🆕 Thêm padding-left để tránh sidebar (sidebar width ~220px)
    height: 'calc(100vh - 80px)',
    overflow: 'hidden'
  },
  breadcrumb: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.2s'
  },
  projectBadge: {
    backgroundColor: '#fff',
    padding: '10px 16px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    border: '1px solid #e0e0e0'
  },
  demoBadge: {
    backgroundColor: '#e3f2fd',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#1976d2',
    border: '1px solid #bbdefb'
  },
  timelineContainer: {
    height: 'calc(100% - 80px)',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    overflow: 'hidden'
  }
} as const;

// 🎭 Mock data
const mockCategories: CategoryData[] = [
  {
    id: 'cat1',
    name: 'Definition & Analysis',
    project_id: '1',
    tasks_count: 5,
    completed_tasks_count: 4
  },
  {
    id: 'cat2', 
    name: 'Design & Planning',
    project_id: '1',
    tasks_count: 7,
    completed_tasks_count: 3
  },
  {
    id: 'cat3',
    name: 'Frontend Development', 
    project_id: '1',
    tasks_count: 8,
    completed_tasks_count: 2
  },
  {
    id: 'cat4',
    name: 'Backend Development',
    project_id: '1', 
    tasks_count: 6,
    completed_tasks_count: 1
  },
  {
    id: 'cat5',
    name: 'Testing & QA',
    project_id: '1',
    tasks_count: 5,
    completed_tasks_count: 0
  },
  {
    id: 'cat6',
    name: 'Deployment & DevOps',
    project_id: '1',
    tasks_count: 4,
    completed_tasks_count: 0
  },
  {
    id: 'cat7',
    name: 'Documentation',
    project_id: '1',
    tasks_count: 3,
    completed_tasks_count: 0
  }
];

const mockTasks: TaskData[] = [
  // Definition & Analysis tasks
  {
    id: 'task1',
    name: 'Phân tích yêu cầu khách hàng',
    category_id: 'cat1',
    category_name: 'Definition & Analysis',
    start_date: '01/06/2025',
    due_date: '03/06/2025',
    status: 'Done',
    assignees: ['John Doe', 'Mary Smith']
  },
  {
    id: 'task2',
    name: 'Thiết kế kiến trúc hệ thống',
    category_id: 'cat1', 
    category_name: 'Definition & Analysis',
    start_date: '02/06/2025',
    due_date: '06/06/2025',
    status: 'Done',
    assignees: ['Alex Johnson']
  },
  {
    id: 'task3',
    name: 'Định nghĩa API specifications',
    category_id: 'cat1',
    category_name: 'Definition & Analysis', 
    start_date: '05/06/2025',
    due_date: '08/06/2025',
    status: 'Done',
    assignees: ['Mike Wilson']
  },
  {
    id: 'task4',
    name: 'Thiết kế database schema',
    category_id: 'cat1',
    category_name: 'Definition & Analysis',
    start_date: '07/06/2025',
    due_date: '10/06/2025',
    status: 'In Progress',
    assignees: ['Sarah Davis']
  },
  {
    id: 'task5',
    name: 'Đánh giá công nghệ và stack',
    category_id: 'cat1',
    category_name: 'Definition & Analysis',
    start_date: '09/06/2025',
    due_date: '11/06/2025',
    status: 'Todo',
    assignees: ['Tom Brown']
  },
  // Design & Planning tasks
  {
    id: 'task6',
    name: 'Thiết kế UI/UX cho dashboard',
    category_id: 'cat2',
    category_name: 'Design & Planning',
    start_date: '10/06/2025',
    due_date: '15/06/2025',
    status: 'In Progress',
    assignees: ['Lisa Chen', 'David Lee']
  },
  {
    id: 'task7',
    name: 'Tạo wireframe cho mobile app',
    category_id: 'cat2',
    category_name: 'Design & Planning',
    start_date: '12/06/2025', 
    due_date: '17/06/2025',
    status: 'In Progress',
    assignees: ['Emma White']
  },
  {
    id: 'task8',
    name: 'Design system và component library',
    category_id: 'cat2',
    category_name: 'Design & Planning',
    start_date: '14/06/2025',
    due_date: '20/06/2025',
    status: 'Todo',
    assignees: ['Kevin Zhang']
  },
  // Frontend Development tasks
  {
    id: 'task9',
    name: 'Setup React project structure',
    category_id: 'cat3',
    category_name: 'Frontend Development',
    start_date: '25/06/2025',
    due_date: '27/06/2025',
    status: 'Todo',
    assignees: ['John Doe']
  },
  {
    id: 'task10',
    name: 'Implement authentication flow',
    category_id: 'cat3',
    category_name: 'Frontend Development',
    start_date: '28/06/2025',
    due_date: '05/07/2025',
    status: 'Todo',
    assignees: ['Mary Smith', 'Alex Johnson']
  }
];

// 🔄 Loading Spinner Component
const Spinner: React.FC = () => (
  <div style={{
    width: '60px',
    height: '60px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  }} />
);

// 📱 Loading State Component
const LoadingState: React.FC = () => (
  <MainLayout>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'calc(100vh - 120px)',
      fontSize: '18px',
      color: '#666'
    }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner />
        <div style={{ fontSize: '20px', fontWeight: '500', marginBottom: '8px' }}>
          ⏳ Đang tải timeline...
        </div>
        <div style={{ fontSize: '14px', color: '#999' }}>
          Vui lòng chờ trong giây lát
        </div>
      </div>
    </div>
  </MainLayout>
);

// ❌ Error State Component
const ErrorState: React.FC<{ error: string; projectId: string }> = ({ error, projectId }) => (
  <MainLayout>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'calc(100vh - 120px)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>😞</div>
        <h2 style={{
          color: '#e74c3c',
          marginBottom: '15px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Oops! Có lỗi xảy ra
        </h2>
        <p style={{
          color: '#666',
          marginBottom: '30px',
          lineHeight: '1.6',
          fontSize: '16px'
        }}>
          {error}
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🔄 Thử lại
          </button>
          <Link href={`/projects/${projectId}`}>
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ← Quay lại dự án
            </button>
          </Link>
        </div>
      </div>
    </div>
  </MainLayout>
);

// 📋 Not Found State Component  
const NotFoundState: React.FC = () => (
  <MainLayout>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'calc(100vh - 120px)'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
        <h2 style={{ 
          color: '#e74c3c', 
          marginBottom: '15px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Không tìm thấy dự án
        </h2>
        <Link href="/projects">
          <button style={{
            padding: '12px 24px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ← Quay lại danh sách dự án
          </button>
        </Link>
      </div>
    </div>
  </MainLayout>
);

// 🧭 Breadcrumb Component
const Breadcrumb: React.FC<{ projectId: string; projectName: string }> = ({ 
  projectId, 
  projectName 
}) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#f8f9fa';
    e.currentTarget.style.borderColor = '#3498db';
    e.currentTarget.style.transform = 'translateY(-1px)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#fff';
    e.currentTarget.style.borderColor = '#ddd';
    e.currentTarget.style.transform = 'translateY(0)';
  };

  return (
    <div style={STYLES.breadcrumb}>
      <Link href={`/projects/${projectId}`}>
        <button 
          style={STYLES.backButton}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          ← Quay lại dự án
        </button>
      </Link>
      
      <div style={STYLES.projectBadge}>
        📊 Timeline: {projectName}
      </div>
      
      <div style={STYLES.demoBadge}>
        🎭 Demo Data
      </div>
    </div>
  );
};

// 🎯 Custom Hook cho Timeline Data
const useTimelineData = (projectId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 📡 Fetch project data (real API)
        const projectData = await fetchProjectById(projectId);
        setProject(projectData);

        // 🎭 Use mock data cho tasks và categories
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setTasks(mockTasks);
        setCategories(mockCategories);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError('Không thể tải dữ liệu timeline. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [projectId]);

  return { project, tasks, categories, loading, error };
};

// 🏁 Main Component
const ProjectTimelinePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const projectId = id as string;

  // 🎯 Use custom hook
  const { project, tasks, categories, loading, error } = useTimelineData(projectId);

  const handleCloseTimeline = () => {
    router.push(`/projects/${projectId}`);
  };

  // 📱 Early returns for different states
  if (!router.isReady || !projectId) return null;
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} projectId={projectId} />;
  if (!project) return <NotFoundState />;

  // 🎉 Main render - Trang bình thường trong MainLayout
  return (
    <MainLayout>
      <div style={STYLES.container}>
        <Breadcrumb projectId={projectId} projectName={project.project_name} />
        
        <div style={STYLES.timelineContainer}>
          <ProjectTimeline
            projectId={project.project_id}
            projectStartDate={project.start_date}
            projectEndDate={project.end_date}
            categories={categories}
            tasks={tasks}
            onClose={handleCloseTimeline}
  
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </MainLayout>
  );
};

export default ProjectTimelinePage;