import React, { useEffect } from 'react';
import { Project } from '@/modules/projects/types/project';
import styles from '../ViewProjectPage.module.css';

interface ProjectInfoProps {
  project: Project;
}

export const ProjectInfo: React.FC<ProjectInfoProps> = ({ project }) => {
  useEffect(() => {
    console.log('Project Details:', {
      id: project.project_id,
      name: project.project_name,
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      manager: project.manager,
      progress: project.progress || 0,
      members: project.members || []
    });
    
    // Log cấu trúc manager để debug nếu có vấn đề với manager.name
    console.log('Manager Details:', project.manager);
    
  }, [project]);
  return (
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
          <span className={styles.managerName}>{project.manager.full_name}</span>
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
  );
};