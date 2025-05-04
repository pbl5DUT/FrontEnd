// modules/stacks/components/TeamProjectSelector.tsx
import React, { useState, useEffect } from 'react';
import teamTasksService from '../services/team_tasks_service_mock';
import { Project } from '../types/teamStasks';
import styles from '../styles/TeamTasks.module.css';

interface TeamProjectSelectorProps {
  onSelectProject: (projectId: string | null) => void;
  selectedProjectId: string | null;
}

const TeamProjectSelector: React.FC<TeamProjectSelectorProps> = ({
  onSelectProject,
  selectedProjectId,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await teamTasksService.getAllProjects();
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
    <div className={styles.projectSelector}>
      <label className={styles.selectorLabel}>Dự án:</label>
      {loading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : (
        <select
          value={selectedProjectId || ''}
          onChange={(e) => onSelectProject(e.target.value || null)}
          className={styles.projectSelect}
        >
          <option value="">Tất cả dự án</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default TeamProjectSelector;
