// modules/stacks/components/FolderTree.tsx
import React, { useState, useEffect } from 'react';
import stacksService from '../services/tasks_services_mock';
import { Project } from '../types/task';
import styles from '../styles/Stacks.module.css';

interface FolderTreeProps {
  onSelectProject: (projectId: string | null) => void;
  selectedProjectId: string | null;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  onSelectProject,
  selectedProjectId,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await stacksService.getAllProjects();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className={styles.folderTree}>
      <h3 className={styles.treeTitle}>Dự án</h3>

      {loading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : (
        <ul className={styles.folderList}>
          <li
            className={`${styles.folderItem} ${
              selectedProjectId === null ? styles.selected : ''
            }`}
            onClick={() => onSelectProject(null)}
          >
            <span className={styles.folderIcon}>📁</span>
            <span>Tất cả công việc</span>
          </li>

          {projects.map((project) => (
            <li
              key={project.id}
              className={`${styles.folderItem} ${
                selectedProjectId === project.id ? styles.selected : ''
              }`}
              onClick={() => onSelectProject(project.id)}
            >
              <span className={styles.folderIcon}>📁</span>
              <span>{project.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FolderTree;
