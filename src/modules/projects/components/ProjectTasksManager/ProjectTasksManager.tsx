import React, { useState, useEffect } from 'react';
import styles from './ProjectTasksManager.module.css';
import TaskCategories from './TaskCategories';
import CategoryTasks from './CategoryTasks';
// import TaskDetail from './TaskDetail';
import { getTaskCategories } from '../../services/taskService';
import { Task } from '../../types/Task';
import { TaskCategory } from '../../types/TaskCategory';

interface ProjectTasksManagerProps {
  projectId: string;
}

const ProjectTasksManager: React.FC<ProjectTasksManagerProps> = ({ projectId }) => {
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState<'categories' | 'tasks' | 'task-detail'>('categories');
  const [loading, setLoading] = useState<boolean>(true);

  // Load dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoryData = await getTaskCategories(projectId);
        setCategories(categoryData);

        // TODO: Gọi API task ở đây nếu đã có
        setTasks([]); // Hiện tại vẫn chưa có API getTasksByProject
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu từ API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Các hàm xử lý navigation
  const handleViewCategory = (category: TaskCategory) => {
    setSelectedCategory(category);
    setView('tasks');
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setView('task-detail');
  };

  const handleBackToCategories = () => {
    setView('categories');
    setSelectedCategory(null);
    setSelectedTask(null);
  };

  const handleBackToTasks = () => {
    setView('tasks');
    setSelectedTask(null);
  };

  const handleAddCategory = () => {
    // Implement add category logic
    // Hiển thị modal/form thêm danh mục
    console.log('Show add category modal');
  };

  const handleAddTask = () => {
    // Implement add task logic
    // Hiển thị modal/form thêm công việc
    console.log('Show add task modal');
  };

  const handleUpdateTask = (updatedTask: Task) => {
    // Logic cập nhật task
    console.log('Update task:', updatedTask);
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setSelectedTask(updatedTask);
  };

  const handleDeleteTask = () => {
    // Logic xóa task
    console.log('Delete task:', selectedTask);
    if (selectedTask) {
      setTasks(tasks.filter(task => task.id !== selectedTask.id));
      handleBackToTasks();
    }
  };

  const handleAddComment = (content: string) => {
    // Logic thêm comment
    console.log('Add comment:', content);
  };

  const handleAddAssignee = (userId: string) => {
    // Logic thêm assignee
    console.log('Add assignee:', userId);
  };

  const handleRemoveAssignee = (userId: string) => {
    // Logic xóa assignee
    console.log('Remove assignee:', userId);
  };

  const handleUploadAttachment = (file: File) => {
    // Logic upload file đính kèm
    console.log('Upload attachment:', file);
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    // Logic xóa file đính kèm
    console.log('Delete attachment:', attachmentId);
  };

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
          onAddCategory={handleAddCategory}
          onViewCategory={handleViewCategory}
        />
      )}
      
      {view === 'tasks' && selectedCategory && (
        <CategoryTasks
          projectId={projectId}
          category={selectedCategory}
          tasks={categoryTasks}
          onAddTask={handleAddTask}
          onBack={handleBackToCategories}
          onViewTask={handleViewTask}
        />
      )}
      
      {/* {view === 'task-detail' && selectedTask && selectedCategory && (
        <TaskDetail
          projectId={projectId}
          categoryId={selectedCategory.id}
          task={selectedTask}
          onBack={handleBackToTasks}
          // onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          onAddComment={handleAddComment}
          onAddAssignee={handleAddAssignee}
          onRemoveAssignee={handleRemoveAssignee}
          // onUploadAttachment={handleUploadAttachment}
         />
      )} */}
    </div>
  );
};

export default ProjectTasksManager;