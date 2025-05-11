import React, { useState, useEffect } from 'react';
import styles from './CategoryTasks.module.css';
import { Task } from '../../types/Task';
import { TaskCategory } from '../../types/TaskCategory';

interface CategoryTasksProps {
  projectId: string;
  category: TaskCategory;
  tasks: Task[];
  onAddTask: () => void;
  onBack: () => void;
  onViewTask: (task: Task) => void; // Sử dụng callback thay vì router
}

const CategoryTasks: React.FC<CategoryTasksProps> = ({
  projectId,
  category,
  tasks,
  onAddTask,
  onBack,
  onViewTask, // Nhận prop callback
}) => {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    let filtered = [...tasks];

    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(term) ||
          (task.description && task.description.toLowerCase().includes(term))
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, statusFilter, searchTerm]);

  const handleViewTask = (task: Task) => {
    onViewTask(task); // Gọi callback thay vì router.push
  };

  // Lấy màu cho priority badge
  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  // Lấy màu cho status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo':
        return styles.statusTodo;
      case 'In Progress':
        return styles.statusInProgress;
      case 'Done':
        return styles.statusDone;
      case 'Cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  return (
    <div className={styles.categoryTasksContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <img
            src="/assets/icons/back-arrow.png"
            alt="Quay lại"
            className={styles.backIcon}
          />
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
          <span className={styles.statValue}>{category.tasks_count}</span>
          <span className={styles.statLabel}>Tổng công việc</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>
            {category.completed_tasks_count}
          </span>
          <span className={styles.statLabel}>Đã hoàn thành</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>
            {Math.round(
              (category.completed_tasks_count /
                Math.max(category.tasks_count, 1)) *
                100
            )}
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
            className={`${styles.filterButton} ${
              statusFilter === 'all' ? styles.active : ''
            }`}
            onClick={() => setStatusFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={`${styles.filterButton} ${
              statusFilter === 'Todo' ? styles.active : ''
            }`}
            onClick={() => setStatusFilter('Todo')}
          >
            Chưa làm
          </button>
          <button
            className={`${styles.filterButton} ${
              statusFilter === 'In Progress' ? styles.active : ''
            }`}
            onClick={() => setStatusFilter('In Progress')}
          >
            Đang làm
          </button>
          <button
            className={`${styles.filterButton} ${
              statusFilter === 'Done' ? styles.active : ''
            }`}
            onClick={() => setStatusFilter('Done')}
          >
            Hoàn thành
          </button>
          <button
            className={`${styles.filterButton} ${
              statusFilter === 'Cancelled' ? styles.active : ''
            }`}
            onClick={() => setStatusFilter('Cancelled')}
          >
            Hủy bỏ
          </button>
        </div>

        <button className={styles.addTaskButton} onClick={onAddTask}>
          <img
            src="/assets/icons/plus.png"
            alt="Thêm"
            className={styles.addIcon}
          />
          Thêm công việc
        </button>
      </div>

      {filteredTasks.length > 0 ? (
        <div className={styles.tasksList}>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={styles.taskCard}
              onClick={() => handleViewTask(task)}
            >
              <div className={styles.taskHeader}>
                <h3 className={styles.taskName}>{task.name}</h3>
                <div className={styles.taskBadges}>
                  {task.priority && (
                    <span
                      className={`${styles.priorityBadge} ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  )}
                  <span
                    className={`${styles.statusBadge} ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>

              {task.description && (
                <p className={styles.taskDescription}>{task.description}</p>
              )}

              <div className={styles.taskFooter}>
                <div className={styles.taskDates}>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>Bắt đầu:</span>
                    <span className={styles.dateValue}>{task.start_date}</span>
                  </div>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>Kết thúc:</span>
                    <span className={styles.dateValue}>{task.due_date}</span>
                  </div>
                </div>

                <div className={styles.taskAssignees}>
                  {task.assignees.slice(0, 3).map((assignee, index) => (
                    <div
                      key={assignee.id}
                      className={styles.assigneeAvatar}
                      title={assignee.name}
                    >
                      {assignee.avatar ? (
                        <img
                          src={assignee.avatar}
                          alt={assignee.name}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {(assignee.name ?? '').charAt(0)}
                        </div>
                      )}
                    </div>
                  ))}

                  {task.assignees.length > 3 && (
                    <div className={styles.moreAssignees}>
                      +{task.assignees.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <img
            src="/assets/icons/task.png"
            alt="Task"
            className={styles.emptyIcon}
          />
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