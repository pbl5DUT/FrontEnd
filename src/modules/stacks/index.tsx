// modules/stacks/index.tsx
import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import TaskBoard from './components/task_board';


import styles from './styles/Stacks.module.css';
import { getCurrentUser } from '../auth/services/authService';
import { Task } from './types/stacks';

const TasksPage: React.FC = () => {
  // Trong ứng dụng thực tế, userId sẽ được lấy từ context authentication
  const [userId, setUserId] = useState<string>('');


  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [refreshTasks, setRefreshTasks] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

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
    setSelectedTask(null);
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUserId(currentUser.user_id.toString());
    }
  }, []);
  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.tasksContainer}>
        <div className={styles.headerControls}>
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

          {/* <ProjectSelector
            onSelectProject={handleSelectProject}
            selectedProjectId={selectedProjectId}
          /> */}
        </div>

        {userId && viewMode === 'board' && (
          < TaskBoard
            projectId={selectedProjectId}
            userId={userId}
            onSelectTask={handleSelectTask}
            key={`task-board-${refreshTasks}`}
          />
        )}

        {/* {viewMode === 'list' && (
          <TaskList
            projectId={selectedProjectId}
            userId={userId}
            onSelectTask={handleSelectTask}
            key={`task-list-${refreshTasks}`}
          />
        )} */}

        {selectedTask && (
          <div className={styles.modalOverlay} onClick={handleCloseDetail}>
            <div
              className={styles.taskDetail}
              onClick={(e) => e.stopPropagation()}
            >
              {/* <TaskDetail
                task={selectedTask}
                onClose={handleCloseDetail}
                onTaskUpdated={handleTaskUpdated}
              /> */}
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default TasksPage;
