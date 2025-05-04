// modules/stacks/components/TeamTaskBoard.tsx
import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import teamTasksService from '../services/team_tasks_service_mock';
import { Task, TaskStatus } from '../types/teamStasks';
import TeamTaskCard from './team_task_card';
import styles from '../styles/team_stasks.module.css';

interface TeamTaskBoardProps {
  projectId: string | null;
  onSelectTask: (task: Task) => void;
  onTaskUpdated: () => void;
}

// Component cho một cột
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

  const dropRef = React.useRef<HTMLDivElement>(null);
  drop(dropRef);

  return (
    <div
      className={`${styles.boardColumn} ${isOver ? styles.dropOver : ''}`}
      ref={dropRef}
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
            <TeamTaskCard
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

const TeamTaskBoard: React.FC<TeamTaskBoardProps> = ({
  projectId,
  onSelectTask,
  onTaskUpdated,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        let data: Task[];

        if (projectId) {
          data = await teamTasksService.getTasksByProject(projectId);
        } else {
          data = await teamTasksService.getAllTeamTasks();
        }

        setTasks(data);
      } catch (error) {
        console.error('Error fetching team tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const todoTasks = tasks.filter((task) => task.status === TaskStatus.TODO);
  const inProgressTasks = tasks.filter(
    (task) => task.status === TaskStatus.IN_PROGRESS
  );
  const doneTasks = tasks.filter((task) => task.status === TaskStatus.DONE);

  const handleDropTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== newStatus) {
        await teamTasksService.updateTaskStatus(taskId, newStatus);
        // Cập nhật state local
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t
          )
        );
        onTaskUpdated();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải công việc nhóm...</div>;
  }

  return (
    <div className={styles.taskBoard}>
      <div className={styles.boardColumns}>
        <Column
          status={TaskStatus.TODO}
          title="Todo"
          description="Các công việc chưa bắt đầu"
          tasks={todoTasks}
          onSelectTask={onSelectTask}
          onDropTask={handleDropTask}
        />

        <Column
          status={TaskStatus.IN_PROGRESS}
          title="In Progress"
          description="Các công việc đang được thực hiện"
          tasks={inProgressTasks}
          onSelectTask={onSelectTask}
          onDropTask={handleDropTask}
        />

        <Column
          status={TaskStatus.DONE}
          title="Done"
          description="Các công việc đã hoàn thành"
          tasks={doneTasks}
          onSelectTask={onSelectTask}
          onDropTask={handleDropTask}
        />
      </div>
    </div>
  );
};

export default TeamTaskBoard;
