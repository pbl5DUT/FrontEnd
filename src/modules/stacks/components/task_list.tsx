// modules/stacks/components/TaskList.tsx
import React, { useState, useEffect } from 'react';
import stacksService from '../services/tasks_services_mock';
import { Task, TaskStatus, TaskPriority } from '../types/stacks';
import styles from '../styles/Stacks.module.css';

interface TaskListProps {
  projectId: string | null;
  userId: string;
  onSelectTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  projectId,
  userId,
  onSelectTask,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');

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

  const filteredTasks =
    filter === 'ALL' ? tasks : tasks.filter((task) => task.status === filter);

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'Todo';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.DONE:
        return 'Done';
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'Thấp';
      case TaskPriority.MEDIUM:
        return 'Trung bình';
      case TaskPriority.HIGH:
        return 'Cao';
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải công việc...</div>;
  }

  return (
    <div className={styles.taskListView}>
      <div className={styles.listControls}>
        <div className={styles.filterGroup}>
          <label htmlFor="statusFilter">Trạng thái:</label>
          <select
            id="statusFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as TaskStatus | 'ALL')}
            className={styles.filterSelect}
          >
            <option value="ALL">Tất cả</option>
            <option value={TaskStatus.TODO}>
              {getStatusLabel(TaskStatus.TODO)}
            </option>
            <option value={TaskStatus.IN_PROGRESS}>
              {getStatusLabel(TaskStatus.IN_PROGRESS)}
            </option>
            <option value={TaskStatus.DONE}>
              {getStatusLabel(TaskStatus.DONE)}
            </option>
          </select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className={styles.emptyList}>
          <p>
            Không có công việc nào{' '}
            {filter !== 'ALL' ? `ở trạng thái ${getStatusLabel(filter)}` : ''}
          </p>
        </div>
      ) : (
        <table className={styles.taskTable}>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Dự án</th>
              <th>Trạng thái</th>
              <th>Độ ưu tiên</th>
              <th>Hạn hoàn thành</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={styles.taskRow}
              >
                <td className={styles.taskTitleCell}>{task.title}</td>
                <td>{task.projectName}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      styles[`status${task.status}`]
                    }`}
                  >
                    {getStatusLabel(task.status)}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles.priorityBadge} ${
                      styles[`priority${task.priority}`]
                    }`}
                  >
                    {getPriorityLabel(task.priority)}
                  </span>
                </td>
                <td>{new Date(task.dueDate).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TaskList;
