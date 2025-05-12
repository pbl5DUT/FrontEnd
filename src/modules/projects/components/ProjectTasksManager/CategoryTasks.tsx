import React, { useState, useEffect } from 'react';
import styles from './CategoryTasks.module.css';
import { Task, getTasksByCategory } from '../../services/taskService';
import { TaskCategory } from '../../services/taskService';

interface CategoryTasksProps {
  projectId: string;
  category: TaskCategory;
  onAddTask: () => void;
  onBack: () => void;
  onViewTask: (task: Task) => void;
}

const CategoryTasks: React.FC<CategoryTasksProps> = ({
  projectId,
  category,
  onAddTask,
  onBack,
  onViewTask,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [category.id]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await getTasksByCategory(category.id);
      setTasks(tasksData);
      setFilteredTasks(tasksData);
    } catch (err) {
      setError('Không thể tải danh sách công việc. Vui lòng thử lại.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...tasks];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.task_name.toLowerCase().includes(term) ||
          (task.description && task.description.toLowerCase().includes(term))
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, statusFilter, searchTerm]);

  const handleViewTask = (task: Task) => {
    console.log('CategoryTasks - Task:', task);
    onViewTask(task);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Urgent':
      case 'Critical':
        return styles.priorityUrgent;
      case 'High':
        return styles.priorityHigh;
      case 'Medium':
        return styles.priorityMedium;
      case 'Low':
        return styles.priorityLow;
      default:
        return '';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Todo':
        return styles.statusTodo;
      case 'In Progress':
        return styles.statusInProgress;
      case 'Review':
        return styles.statusReview;
      case 'Done':
        return styles.statusDone;
      case 'Cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className={styles.categoryTasksContainer}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onBack}>
            <img src="/assets/icons/back-arrow.png" alt="Quay lại" className={styles.backIcon} />
            Quay lại danh mục
          </button>
          <h2>{category.name}</h2>
        </div>
        <div className={styles.loading}>
          <div>Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.categoryTasksContainer}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onBack}>
            <img src="/assets/icons/back-arrow.png" alt="Quay lại" className={styles.backIcon} />
            Quay lại danh mục
          </button>
          <h2>{category.name}</h2>
        </div>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchTasks}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.categoryTasksContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <img src="/assets/icons/back-arrow.png" alt="Quay lại" className={styles.backIcon} />
          Quay lại danh mục
        </button>
        <h2>{category.name}</h2>
      </div>

      {category.description && (
        <div className={styles.description}>
          <p>{category.description}</p>
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{tasks.length}</span>
          <span className={styles.statLabel}>Tổng công việc</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>
            {tasks.filter(task => task.status === 'Done').length}
          </span>
          <span className={styles.statLabel}>Đã hoàn thành</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>
            {tasks.length > 0 
              ? Math.round((tasks.filter(task => task.status === 'Done').length / tasks.length) * 100)
              : 0}
            %
          </span>
          <span className={styles.statLabel}>Tiến độ</span>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.statusFilters}>
          <button
            className={`${styles.filterButton} ${statusFilter === 'all' ? styles.active : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={`${styles.filterButton} ${statusFilter === 'Todo' ? styles.active : ''}`}
            onClick={() => setStatusFilter('Todo')}
          >
            Chưa làm
          </button>
          <button
            className={`${styles.filterButton} ${statusFilter === 'In Progress' ? styles.active : ''}`}
            onClick={() => setStatusFilter('In Progress')}
          >
            Đang làm
          </button>
          <button
            className={`${styles.filterButton} ${statusFilter === 'Review' ? styles.active : ''}`}
            onClick={() => setStatusFilter('Review')}
          >
            Đang xét duyệt
          </button>
          <button
            className={`${styles.filterButton} ${statusFilter === 'Done' ? styles.active : ''}`}
            onClick={() => setStatusFilter('Done')}
          >
            Hoàn thành
          </button>
        </div>

        <button className={styles.addTaskButton} onClick={onAddTask}>
          <img src="/assets/icons/plus.png" alt="Thêm" className={styles.addIcon} />
          Thêm công việc
        </button>
      </div>

      {filteredTasks.length > 0 ? (
        <div className={styles.tasksList}>
          {filteredTasks.map((task) => (
            <div
              key={task.task_id}
              className={styles.taskCard}
              onClick={() => handleViewTask(task)}
            >
              <div className={styles.taskHeader}>
                <h3 className={styles.taskName}>{task.task_name}</h3>
                <div className={styles.taskBadges}>
                  {task.priority ? (
                    <span className={`${styles.priorityBadge} ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  ) : (
                    <span className={styles.priorityBadge}>No Priority</span>
                  )}
                  {task.status && (
                    <span className={`${styles.statusBadge} ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  )}
                </div>
              </div>

              {task.description && (
                <p className={styles.taskDescription}>{task.description}</p>
              )}

              <div className={styles.taskFooter}>
                <div className={styles.taskDates}>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>Bắt đầu:</span>
                    <span className={styles.dateValue}>{task.start_date || 'N/A'}</span>
                  </div>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>Kết thúc:</span>
                    <span className={styles.dateValue}>{task.due_date || 'N/A'}</span>
                  </div>
                </div>

                <div className={styles.taskAssignees}>
                  {task.assignee && (
                    <div className={styles.assigneeAvatar} title={task.assignee.full_name}>
                      {task.assignee.avatar ? (
                        <img src={task.assignee.avatar} alt={task.assignee.full_name} />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {task.assignee.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <img src="/assets/icons/task.png" alt="Task" className={styles.emptyIcon} />
          <p>
            {searchTerm
              ? 'Không tìm thấy công việc phù hợp. Vui lòng thử từ khóa khác.'
              : 'Chưa có công việc nào trong danh mục này. Hãy thêm công việc đầu tiên.'}
          </p>
          {!searchTerm && (
            <button className={styles.createButton} onClick={onAddTask}>
              Tạo công việc mới
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryTasks;