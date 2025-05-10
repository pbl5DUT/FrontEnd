import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './ProjectTasksManager.module.css';
import TaskCategories from './TaskCategories';
import CategoryTasks from './CategoryTasks';
import TaskDetail from './TaskDetail';
import { getTaskCategories } from '../../services/taskService'; // chỉnh đúng path
import { Task } from '../../types/Task'; // giả sử bạn tách các interface vào /types
import { TaskCategory } from '../../types/TaskCategory';
// Removed redundant import of TaskCategory
interface ProjectTasksManagerProps {
  projectId: string;
}

const ProjectTasksManager: React.FC<ProjectTasksManagerProps> = ({ projectId }) => {
  const router = useRouter();
  const { categoryId, taskId } = router.query;

  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState<'categories' | 'tasks' | 'task-detail'>('categories');
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Load dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoryData = await getTaskCategories(projectId);
        setCategories(categoryData);

        // TODO: Gọi API task ở đây nếu đã có
        setTasks([]); // ⚠️ Hiện tại vẫn chưa có API getTasksByProject
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu từ API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // ✅ Xử lý route thay đổi
  useEffect(() => {
    if (!loading) {
      if (taskId) {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          setSelectedTask(task);
          const category = categories.find((c) => c.id === task.category_id);
          if (category) setSelectedCategory(category);
          setView('task-detail');
        }
      } else if (categoryId) {
        const category = categories.find((c) => c.id === categoryId);
        if (category) {
          setSelectedCategory(category);
          setView('tasks');
        }
      } else {
        setView('categories');
      }
    }
  }, [loading, categoryId, taskId, categories, tasks]);

  // Các hàm xử lý: handleAddCategory, handleViewCategory, handleBackToCategories, ...
  // (Bạn giữ nguyên như cũ - chúng không phụ thuộc mock data)

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  const categoryTasks = tasks.filter(
    (task) => selectedCategory && task.category_id === selectedCategory.id
  );

  return (
    <div className={styles.tasksManager}>
      {view === 'categories' && (
        <TaskCategories
          projectId={projectId}
          categories={categories}
          onAddCategory={() => alert('Thêm danh mục sẽ triển khai sau')}
        />
      )}
      {view === 'tasks' && selectedCategory && (
        <CategoryTasks
          projectId={projectId}
          category={selectedCategory}
          tasks={categoryTasks}
          onAddTask={() => alert('Thêm công việc sẽ triển khai sau')}
          onBack={() => router.push(`/projects/${projectId}`)}
        />
      )}
      {view === 'task-detail' && selectedTask && selectedCategory && (
        <TaskDetail
          projectId={projectId}
          categoryId={selectedCategory.id}
          task={selectedTask}
          onBack={() => router.push(`/projects/${projectId}/categories/${selectedCategory.id}`)}
          onUpdate={() => {}}
          onDelete={() => {}}
          onAddComment={() => {}}
          onAddAssignee={() => {}}
          onRemoveAssignee={() => {}}
          onUploadAttachment={() => {}}
          onDeleteAttachment={() => {}}
        />
      )}
    </div>
  );
};

export default ProjectTasksManager;
