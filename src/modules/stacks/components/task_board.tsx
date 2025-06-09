// modules/stacks/components/TaskBoard.tsx
import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';

import TaskCard from './task_card';
import styles from '../styles/Stacks.module.css';
import { getTasksByProject, getUserTasks, updateTaskStatus } from '../services/taskService';
import { Task, TaskStatus } from '../types/task';

interface TaskBoardProps {
  projectId: string | null;
  userId: string;
  onSelectTask: (task: Task) => void;
}

// Tạo component cho một cột
const Column: React.FC<{
  status: TaskStatus;
  title: string;
  description: string;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onDropTask: (taskId: string, status: TaskStatus) => void;
}> = ({ status, title, description, tasks, onSelectTask, onDropTask }) => {
  // Setup React DnD drop target
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { id: string }) => {
      onDropTask(item.id, status);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const columnRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = (node: HTMLDivElement | null) => {
    drop(node);
    columnRef.current = node;
  };

  return (
    <div
      className={`${styles.boardColumn} ${isOver ? styles.dropOver : ''}`}
      ref={mergedRef}
    >
      <div className={styles.columnHeader}>
        <div className={styles.columnTitle}>
          <span
            className={`${styles.statusIcon} ${
              status !== TaskStatus.TODO
                ? styles[`${status.toLowerCase()}Icon`]
                : ''
            }`}
          >
            ○
          </span>
          <h3>{title}</h3>
          <span className={styles.taskCount}>{tasks.length}</span>
        </div>
        <p className={styles.columnDescription}>{description}</p>
      </div>
      <div className={styles.columnContent}>
        {tasks.length === 0 ? (
          <div className={styles.emptyColumn}>Không có công việc nào</div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.task_id}
              task={task}
              onClick={() => onSelectTask(task)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const TaskBoard: React.FC<TaskBoardProps> = ({
  projectId,
  userId,
  onSelectTask,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        let response: any;

        if (projectId) {
          response = await getTasksByProject(projectId, userId);
        } else {
          response = await getUserTasks(userId);
        }

        console.log('API Response okoki:', response); // Debug log
        
        // Handle different response formats
        let tasksData: Task[] = [];
        
        if (Array.isArray(response)) {
          // Direct array response
          tasksData = response;
        } else if (response && response.data) {
          // Response with data wrapper
          if (Array.isArray(response.data)) {
            tasksData = response.data;
          } else if (response.data.tasks && Array.isArray(response.data.tasks)) {
            tasksData = response.data.tasks;
          } else if (response.data.pending_tasks && Array.isArray(response.data.pending_tasks)) {
            tasksData = response.data.pending_tasks;
          } else if (response.data.user_tasks && Array.isArray(response.data.user_tasks)) {
            tasksData = response.data.user_tasks;
          }
        } else if (response && response.tasks && Array.isArray(response.tasks)) {
          // Direct tasks property
          tasksData = response.tasks;
        }

        // Ensure we have a valid array
        if (!Array.isArray(tasksData)) {
          console.warn('Tasks data is not an array:', tasksData);
          tasksData = [];
        }

        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Không thể tải công việc. Vui lòng thử lại.');
        setTasks([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTasks();
    }
  }, [projectId, userId]);

  // Ensure tasks is always an array before filtering
  const safeFilter = (filterFn: (task: Task) => boolean): Task[] => {
    if (!Array.isArray(tasks)) {
      console.warn('Tasks is not an array:', tasks);
      return [];
    }
    return tasks.filter(filterFn);
  };

  const todoTasks = safeFilter((task) => task.status === TaskStatus.TODO);
  const inProgressTasks = safeFilter(
    (task) => task.status === TaskStatus.IN_PROGRESS
  );
  const doneTasks = safeFilter((task) => task.status === TaskStatus.DONE);

  const handleDropTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const task = tasks.find((t) => t.task_id === taskId);
      if (task && task.status !== newStatus) {
        await updateTaskStatus(taskId, newStatus);
        // Cập nhật state local
        setTasks((prevTasks) =>
          Array.isArray(prevTasks) 
            ? prevTasks.map((t) =>
                t.task_id === taskId ? { ...t, status: newStatus } : t
              )
            : []
        );
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Không thể cập nhật trạng thái công việc.');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải công việc...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className={styles.retryButton}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={styles.taskBoard}>
      <div className={styles.boardColumns}>
        <Column
          status={TaskStatus.TODO}
          title="Todo"
          description="This item hasn't been started"
          tasks={todoTasks}
          onSelectTask={onSelectTask}
          onDropTask={handleDropTask}
        />

        <Column
          status={TaskStatus.IN_PROGRESS}
          title="In Progress"
          description="This is actively being worked on"
          tasks={inProgressTasks}
          onSelectTask={onSelectTask}
          onDropTask={handleDropTask}
        />

        <Column
          status={TaskStatus.DONE}
          title="Done"
          description="This has been completed"
          tasks={doneTasks}
          onSelectTask={onSelectTask}
          onDropTask={handleDropTask}
        />
      </div>
    </div>
  );
};

export default TaskBoard;