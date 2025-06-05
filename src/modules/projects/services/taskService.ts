import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface TaskAssignee {
  name: string | undefined;
  avatar: any;
  id: string | null | undefined;
  user_id: string;
  user: {
    id: string;
    full_name: string;
    avatar: string | null;
  };
  role: string;
  assigned_date: string;
}

export interface TaskComment {
  id: string;
  user_name: string; // API trả string, không cần ReactNode
  user: {
    id: string;
    full_name: string;
    avatar: string | null;
  };
  content: string;
  created_at: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string; // Sử dụng 'url' từ API
  file_type: string;
  file_size: string; // API có thể trả string
  uploaded_by: string;
  upload_date: string;
  size: number; // Giữ để tương thích API hiện tại
}

export interface TaskCategory {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  tasks_count: number;
  completed_tasks_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  task_id: string;
  task_name: string;
  status: 'Todo' | 'In Progress' | 'Done' | 'Cancelled' | 'Review';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical' | 'Urgent';
  description?: string;
  start_date?: string;
  due_date?: string;
  actual_end_date?: string;
  progress?: number;
  created_at?: string;
  updated_at?: string;
  category_name?: string;
  assignee?: {
    user_id: string;
    full_name: string;
    email?: string;
    role?: string;
    department?: string;
    gender?: string;
    birth_date?: string;
    phone?: string;
    province?: string;
    district?: string;
    address?: string;
    position?: string;
    avatar?: string | null;
    created_at?: string;
    enterprise?: {
      enterprise_id: string;
      name: string;
      address: string;
      phone_number: string;
      email: string;
      industry: string;
      created_at: string;
      updated_at: string;
    };
  };
  assignees?: TaskAssignee[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
}

export interface TaskWithDetails extends Task {
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  assignees?: TaskAssignee[];
}

// Category APIs
export const getTaskCategories = async (projectId: string): Promise<TaskCategory[]> => {
  try {
    const response = await api.get(`/projects/${projectId}/task-categories/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task categories:', error);
    throw error;
  }
};

// Task APIs trong file services/taskService.js
export const createTaskCategory = async (
  projectId: string,
  categoryData: { name: string; description?: string; project: string }
): Promise<TaskCategory> => {
  try {
    console.log(`Creating category for project ${projectId} with data:`, categoryData);
    
    const response = await api.post(`/projects/${projectId}/task-categories/`, categoryData);
    
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating task category:', error);
    throw error;
  }
};

export const updateTaskCategory = async (
  projectId: string,
  categoryId: string,
  categoryData: { name?: string; description?: string }
): Promise<TaskCategory> => {
  try {
    const response = await api.patch(`/projects/${projectId}/task-categories/${categoryId}/`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating task category:', error);
    throw error;
  }
};

export const deleteTaskCategory = async (projectId: string, categoryId: string): Promise<void> => {
  try {
    await api.delete(`/projects/${projectId}/task-categories/${categoryId}/`);
  } catch (error) {
    console.error('Error deleting task category:', error);
    throw error;
  }
};

// Task APIs
export const getTasksByCategory = async (categoryId: string): Promise<Task[]> => {
  try {
    const response = await api.get(`/tasks/?category_id=${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks by category:', error);
    throw error;
  }
};

export const getTaskDetail = async (taskId: string): Promise<TaskWithDetails> => {
  try {
    const [taskResponse, commentsResponse, attachmentsResponse] = await Promise.all([
      api.get(`/tasks/${taskId}/`),
      api.get(`/tasks/${taskId}/comments/`),
      api.get(`/tasks/${taskId}/attachments/`),
    ]);

    const task: TaskWithDetails = taskResponse.data;
    task.comments = commentsResponse.data;
    task.attachments = attachmentsResponse.data;

    return task;
  } catch (error) {
    console.error('Error fetching task detail:', error);
    throw error;
  }
};

export const createTask = async (
  projectId: string,
  categoryId: string,
  taskData: {
    task_name: string;
    description: string;
    status: string;
    priority: string;
    start_date: string;
    due_date: string;
    assignee_id?: string;
  }
): Promise<Task> => {
  try {
    const response = await api.post(`/projects/${projectId}/task-categories/${categoryId}/tasks/`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, taskData: Partial<TaskWithDetails>): Promise<TaskWithDetails> => {
  try {
    const response = await api.patch(`/tasks/${taskId}/`, {
      task_name: taskData.task_name,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      start_date: taskData.start_date,
      due_date: taskData.due_date,
      progress: taskData.progress,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await api.delete(`/tasks/${taskId}/`);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Task Actions APIs
export const addTaskComment = async (taskId: string, content: string): Promise<TaskComment> => {
  try {
    const response = await api.post(`/tasks/${taskId}/comments/`, {
      content,
      user_id: 'current-user-id', // Thay bằng user ID thực từ auth
    });
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const uploadTaskAttachment = async (taskId: string, file: File): Promise<TaskAttachment> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/tasks/${taskId}/attachments/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
};

export const deleteTaskAttachment = async (taskId: string, attachmentId: string): Promise<void> => {
  try {
    await api.delete(`/tasks/${taskId}/attachments/${attachmentId}/`);
  } catch (error) {
    console.error('Error deleting attachment:', error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId: string, status: string): Promise<TaskWithDetails> => {
  try {
    const response = await api.patch(`/tasks/${taskId}/`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

export const updateTaskProgress = async (taskId: string, progress: number): Promise<TaskWithDetails> => {
  try {
    const response = await api.patch(`/tasks/${taskId}/`, { progress });
    return response.data;
  } catch (error) {
    console.error('Error updating task progress:', error);
    throw error;
  }
};