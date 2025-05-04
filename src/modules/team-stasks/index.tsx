// modules/stacks/TeamTasks.tsx
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TeamProjectSelector from './components/team_project_selector';
import TeamTaskBoard from './components/team_task_board';
import TeamTaskList from './components/team_task_list';
import TeamTaskDetail from './components/team_task_detail';
import CreateTaskForm from './components/create_task_form';
import { Task } from './types/teamStasks';
import styles from './styles/team_stasks.module.css';

const TeamTasks: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [refreshTasks, setRefreshTasks] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const handleSelectProject = (projectId: string | null) => {
    setSelectedProjectId(projectId);
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
  };

  const handleTaskUpdated = () => {
    setRefreshTasks((prev) => prev + 1);
  };

  const handleCreateTask = () => {
    setIsCreatingTask(true);
  };

  const handleCloseCreateForm = () => {
    setIsCreatingTask(false);
  };

  const handleTaskCreated = () => {
    handleTaskUpdated();
    handleCloseCreateForm();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.teamTasksContainer}>
        <div className={styles.headerControls}>
          <div className={styles.controlsLeft}>
            <div className={styles.viewOptions}>
              <button
                className={`${styles.viewButton} ${
                  viewMode === 'board' ? styles.active : ''
                }`}
                onClick={() => setViewMode('board')}
              >
                Board
              </button>
              <button
                className={`${styles.viewButton} ${
                  viewMode === 'list' ? styles.active : ''
                }`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>

            <TeamProjectSelector
              onSelectProject={handleSelectProject}
              selectedProjectId={selectedProjectId}
            />
          </div>

          <button
            className={styles.createTaskButton}
            onClick={handleCreateTask}
          >
            <span>+</span> Tạo công việc mới
          </button>
        </div>

        {viewMode === 'board' && (
          <TeamTaskBoard
            projectId={selectedProjectId}
            onSelectTask={handleSelectTask}
            onTaskUpdated={handleTaskUpdated}
            key={`task-board-${refreshTasks}`}
          />
        )}

        {viewMode === 'list' && (
          <TeamTaskList
            projectId={selectedProjectId}
            onSelectTask={handleSelectTask}
            onTaskUpdated={handleTaskUpdated}
            key={`task-list-${refreshTasks}`}
          />
        )}

        {selectedTask && (
          <div className={styles.modalOverlay} onClick={handleCloseDetail}>
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <TeamTaskDetail
                task={selectedTask}
                onClose={handleCloseDetail}
                onTaskUpdated={handleTaskUpdated}
              />
            </div>
          </div>
        )}

        {isCreatingTask && (
          <div className={styles.modalOverlay} onClick={handleCloseCreateForm}>
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <CreateTaskForm
                onClose={handleCloseCreateForm}
                onTaskCreated={handleTaskCreated}
              />
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default TeamTasks;
