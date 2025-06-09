import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Project } from '@/modules/projects/types/project';
import styles from '../ViewProjectPage.module.css';

interface ProjectHeaderProps {
  project: Project;
  onDeleteProject: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onDeleteProject
}) => {
  const router = useRouter();
  
  return (
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
        {/* Nút Timeline - Navigate to page */}
        <button
          className={styles.timelineButton}
          onClick={() => router.push(`/projects/${project.project_id}/timeline`)}
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
          onClick={onDeleteProject}
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
  );
};