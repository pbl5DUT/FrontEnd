import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './CategoryTasks.module.css';

// Định nghĩa các kiểu dữ liệu
interface TaskAssignee {
  user_id: string;
  user: {
    id: string;
    full_name: string;
    avatar: string | null;
  };
  role: string;
  assigned_date: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  category_id: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  start_date: string;
  due_date: string;
  assignees: TaskAssignee[];
}

interface TaskCategory {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  tasks_count: number;
  completed_tasks_count: number;
}

interface CategoryTasksProps {
  projectId: string;
  category: TaskCategory;
  tasks: Task[];
  onAddTask: () => void;
  onBack: () => void;
}

const CategoryTasks: React.FC<CategoryTasksProps> = ({
  projectId,
  category,
  tasks,
  onAddTask,
  onBack,
}) => {
  const router = useRouter();
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
          task.description.toLowerCase().includes(term)
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, statusFilter, searchTerm]);

  const handleViewTask = (taskId: string) => {
    router.push(
      `/projects/${projectId}/categories/${category.id}/tasks/${taskId}`
    );
  };

  // Lấy màu cho priority badge
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
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
      case 'Review':
        return styles.statusReview;
      case 'Done':
        return styles.statusDone;
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
              statusFilter === 'Review' ? styles.active : ''
            }`}
            onClick={() => setStatusFilter('Review')}
          >
            Đang xét duyệt
          </button>
          <button
            className={`${styles.filterButton} ${
              statusFilter === 'Done' ? styles.active : ''
            }`}
            onClick={() => setStatusFilter('Done')}
          >
            Hoàn thành
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
              onClick={() => handleViewTask(task.id)}
            >
              <div className={styles.taskHeader}>
                <h3 className={styles.taskName}>{task.name}</h3>
                <div className={styles.taskBadges}>
                  <span
                    className={`${styles.priorityBadge} ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>

              <p className={styles.taskDescription}>{task.description}</p>

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
                      key={index}
                      className={styles.assigneeAvatar}
                      title={`${assignee.user.full_name} (${assignee.role})`}
                    >
                      {assignee.user.avatar ? (
                        <img
                          src={assignee.user.avatar}
                          alt={assignee.user.full_name}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {assignee.user.full_name.charAt(0)}
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
