import React, { useState, useEffect } from 'react';
import styles from './ProjectTasksManager.module.css';
import TaskCategories from './TaskCategories';
import CategoryTasks from './CategoryTasks';
import TaskDetail from './TaskDetail';
import CreateCategoryModal from '../modal/CreateCategoryModal/CreateCategoryModal';
import CreateTaskModal from './CreateTaskModal';
import { Task } from '../../types/Task';
import { 
  getTaskCategories, 
  deleteTaskCategory,
  TaskWithDetails,
  TaskCategory 
} from '../../services/taskService';

interface ProjectTasksManagerProps {
  projectId: string;
}

const ProjectTasksManager: React.FC<ProjectTasksManagerProps> = ({ projectId }) => {
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState<'categories' | 'tasks' | 'task-detail'>('categories');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TaskCategory | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [projectId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoryData = await getTaskCategories(projectId);
      setCategories(categoryData);
    } catch (err) {
      setError('Không thể tải danh mục. Vui lòng thử lại.');
      console.error('Lỗi khi tải danh mục:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCategory = (category: TaskCategory) => {
    setSelectedCategory(category);
    setView('tasks');
  };

  const handleViewTask = (task: Task) => {
    console.log('ProjectTasksManager - Selected Task:', task);
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
    setEditingCategory(null);
    setShowCreateCategoryModal(true);
  };

  const handleEditCategory = (category: TaskCategory) => {
    setEditingCategory(category);
    setShowCreateCategoryModal(true);
  };

  const handleDeleteCategory = async (category: TaskCategory) => {
    try {
      await deleteTaskCategory(projectId, category.id);
      setCategories(categories.filter(cat => cat.id !== category.id));
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Không thể xóa danh mục. Vui lòng thử lại.');
    }
  };

  const handleCategorySuccess = (category: TaskCategory) => {
    if (editingCategory) {
      setCategories(categories.map(cat => 
        cat.id === category.id ? category : cat
      ));
    } else {
      setCategories([...categories, category]);
    }
    setShowCreateCategoryModal(false);
    setEditingCategory(null);
  };

  const handleAddTask = () => {
    setShowCreateTaskModal(true);
  };

  const handleTaskSuccess = (task: Task) => {
    setShowCreateTaskModal(false);
  };

  const handleTaskUpdate = (updatedTask: TaskWithDetails) => {
    setSelectedTask({
      task_id: updatedTask.task_id,
      task_name: updatedTask.task_name,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      start_date: updatedTask.start_date,
      due_date: updatedTask.due_date,
      actual_end_date: updatedTask.actual_end_date,
      assignee: updatedTask.assignee,
      category_name: updatedTask.category_name,
      progress: updatedTask.progress,
      created_at: updatedTask.created_at,
      updated_at: updatedTask.updated_at,
      // assignees: updatedTask.assignees || [],
      // comments: updatedTask.comments || [],
      // attachments: updatedTask.attachments || [],
    });
  };

  const handleTaskDelete = () => {
    handleBackToTasks();
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchCategories}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className={styles.tasksManager}>
      {view === 'categories' && (
        <TaskCategories
          projectId={projectId}
          categories={categories}
          onAddCategory={handleAddCategory}
          onViewCategory={handleViewCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}
      
      {view === 'tasks' && selectedCategory && (
        <CategoryTasks
          projectId={projectId}
          category={selectedCategory}
          onAddTask={handleAddTask}
          onBack={handleBackToCategories}
          onViewTask={handleViewTask}
        />
      )}
      
      {view === 'task-detail' && selectedTask && selectedCategory && (
        <TaskDetail
          projectId={projectId}
          categoryId={selectedCategory.id}
          task={selectedTask}
          onBack={handleBackToTasks}
          // onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
          onAddComment={(content) => {
            console.log('Add comment:', content);
          } }
          onAddAssignee={(userId) => {
            console.log('Add assignee:', userId);
          } }
          onRemoveAssignee={(userId) => {
            console.log('Remove assignee:', userId);
          } }
          onUploadAttachment={(file) => {
            console.log('Upload attachment:', file);
          } }
          onDeleteAttachment={(attachmentId) => {
            console.log('Delete attachment:', attachmentId);
          } } onUpdate={function (updatedTask: Task): void {
            throw new Error('Function not implemented.');
          } }        />
      )}

      <CreateCategoryModal
        projectId={projectId}
        isOpen={showCreateCategoryModal}
        onClose={() => {
          setShowCreateCategoryModal(false);
          setEditingCategory(null);
        }}
        onSuccess={handleCategorySuccess}
        editCategory={editingCategory}
      />

      {selectedCategory && (
        <CreateTaskModal
          projectId={projectId}
          categoryId={selectedCategory.id}
          isOpen={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
          onSuccess={handleTaskSuccess}
        />
      )}
    </div>
  );
};

export default ProjectTasksManager;