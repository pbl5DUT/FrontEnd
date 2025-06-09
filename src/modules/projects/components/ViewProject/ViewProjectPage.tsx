import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Project } from '@/modules/projects/types/project';
import { fetchProjectById } from '@/modules/projects/services/project_service';
import styles from './ViewProjectPage.module.css';
import { MainLayout } from '@/layouts/Mainlayout';
import Link from 'next/link';
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectInfo } from './components/ProjectInfo';
import { ProjectTabs } from './components/ProjectTabs';
import { OverviewTab, MembersTab, FilesTab, CommentsTab } from './components/tabs';
import ProjectTasksManager from '../ProjectTasksManager/ProjectTasksManager';

const ViewProjectPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'members' | 'files' | 'comments'
  >('overview');

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

      {/* 🗑️ BỎ MODAL TIMELINE - giờ là trang riêng */}
    </MainLayout>
  );
};

export default ViewProjectPage;