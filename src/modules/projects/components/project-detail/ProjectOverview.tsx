// components/project-detail/ProjectOverview.tsx
import React from 'react';
import { Project } from '@/modules/projects/types/project';
import styles from './ProjectOverview.module.css';

interface ProjectOverviewProps {
  project: Project;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
  return (
    <div className={styles.overviewTab}>
      <div className={styles.descriptionSection}>
        <h3>Mô tả dự án</h3>
        <p className={styles.description}>{project.description || 'Không có mô tả'}</p>
      </div>

      <div className={styles.statsSection}>
        <h3>Thống kê dự án</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{project.stats?.total_tasks || 0}</div>
            <div className={styles.statLabel}>Số lượng phân việc</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{project.stats?.completed_tasks || 0}</div>
            <div className={styles.statLabel}>Đóng</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{project.stats?.in_progress || 0}</div>
            <div className={styles.statLabel}>Đang thực hiện</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{project.stats?.pending_tasks || 0}</div>
            <div className={styles.statLabel}>Kiểm duyệt</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;