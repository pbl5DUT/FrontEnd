// modules/stacks/components/TaskBoard.tsx
import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import stacksService from '../services/tasks_services_mock';
import { Task, TaskStatus } from '../types/stacks';
import TaskCard from './task_card';
import styles from '../styles/Stacks.module.css';

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
              key={task.id}
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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        let data: Task[];

        if (projectId) {
          data = await stacksService.getTasksByProject(projectId, userId);
        } else {
          data = await stacksService.getUserTasks(userId);
        }

        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId, userId]);

  const todoTasks = tasks.filter((task) => task.status === TaskStatus.TODO);
  const inProgressTasks = tasks.filter(
    (task) => task.status === TaskStatus.IN_PROGRESS
  );
  const doneTasks = tasks.filter((task) => task.status === TaskStatus.DONE);

  const handleDropTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== newStatus) {
        await stacksService.updateTaskStatus(taskId, newStatus);
        // Cập nhật state local
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t
          )
        );
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải công việc...</div>;
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
