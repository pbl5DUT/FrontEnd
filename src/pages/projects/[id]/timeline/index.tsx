import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/layouts/Mainlayout';
import ProjectTimeline from '@/modules/projects/components/ProjectTimeline/ProjectTimeline';
import { fetchProjectById  } from '@/modules/projects/services/project_service';
import { Project } from '@/modules/projects/types/project';
import Link from 'next/link';
import { getTaskCategories } from '@/modules/projects/services/taskService';
import { getTasksByProject } from '@/modules/stacks/services/taskService';
import { getCurrentUser } from '@/modules/auth/services/authService';
import { Task, TaskCategory } from '@/modules/projects/types/Task';

// 🎨 Constants cho styling
const STYLES = {
  container: {
    padding: '20px',
    paddingLeft: '260px', 
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
  timelineContainer: {
    height: 'calc(100% - 80px)',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    overflow: 'hidden'
  }
} as const;

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
    </div>
  );
};

// 🎯 Custom Hook cho Timeline Data

const useTimelineData = (projectId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]); // Ensure initial state is Task[]
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUserId(currentUser.user_id.toString());
    }
  }, []);

  useEffect(() => {
    if (!projectId || !userId) return;

    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        setError(null);

        const projectData = await fetchProjectById(projectId);
        setProject(projectData);

        const categoryData = await getTaskCategories(projectId);
        setCategories(categoryData);

        const tasksData = await getTasksByProject(projectId, userId);
        console.log('Fetched tasks:', tasksData); // Debug log
        setTasks(tasksData); // Pass tasksData directly

        setLoading(false);
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError('Không thể tải dữ liệu timeline. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [projectId, userId]);

  return { project, tasks, categories, loading, error, setTasks };
};

// 🏁 Main Component
const ProjectTimelinePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const projectId = id as string;

  // 🎯 Use custom hook
  const { project, tasks, categories, loading, error, setTasks } = useTimelineData(projectId);

  const handleCloseTimeline = () => {
    router.push(`/projects/${projectId}`);
  };

  const handleTaskUpdate = (taskId: string, updatedTask: Partial<Task>) => {
    setTasks(tasks.map(task => task.task_id === taskId ? { ...task, ...updatedTask } : task));
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