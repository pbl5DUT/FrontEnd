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

// Updated TaskStatus to match actual API response
export enum TaskStatus {
  TODO = 'Todo',              // ✅ Changed back to 'Todo' to match API
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
  CANCELLED = 'Cancelled',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
  URGENT = 'Urgent',
  REVIEW = 'Review',
}

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
  status: TaskStatus;
  priority?: TaskPriority;
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
  project_info?: {
    project_id: string;
    project_name: string;
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

// Helper function to extract tasks from API response
const extractTasksFromResponse = (response: any): Task[] => {
  // Handle different response formats from new API
  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.success && response.data) {
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data.tasks && Array.isArray(response.data.tasks)) {
      return response.data.tasks;
    }
    if (response.data.pending_tasks && Array.isArray(response.data.pending_tasks)) {
      return response.data.pending_tasks;
    }
    if (response.data.overdue_tasks && Array.isArray(response.data.overdue_tasks)) {
      return response.data.overdue_tasks;
    }
    if (response.data.high_priority_tasks && Array.isArray(response.data.high_priority_tasks)) {
      return response.data.high_priority_tasks;
    }
  }
  
  if (response.tasks && Array.isArray(response.tasks)) {
    return response.tasks;
  }
  
  console.warn('Unexpected response format:', response);
  return [];
};

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

// Updated: Lấy công việc của một người dùng trong một dự án cụ thể
export const getTasksByProject = async (projectId: string, userId: string): Promise<Task[]> => {
  try {
    const response = await api.get(`/tasks/user/${userId}/project/${projectId}/`);
    console.log('getTasksByProject response:', response.data);
    
    return extractTasksFromResponse(response.data);
  } catch (error) {
    console.error('Error fetching tasks by project:', error);
    return []; // Return empty array instead of throwing
  }
};

// Updated: Lấy tất cả tasks của user
export const getUserTasks = async (userId: string, options: {
  includeCompleted?: boolean;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
} = {}): Promise<Task[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (options.includeCompleted) {
      queryParams.append('include_completed', 'true');
    }
    if (options.projectId) {
      queryParams.append('project_id', options.projectId);
    }
    if (options.status) {
      queryParams.append('status', options.status);
    }
    if (options.priority) {
      queryParams.append('priority', options.priority);
    }

    const url = `/tasks/user/${userId}/?${queryParams.toString()}`;
    const response = await api.get(url);
    console.log('getUserTasks response:', response.data);
    
    return extractTasksFromResponse(response.data);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    return []; // Return empty array instead of throwing
  }
};

// New: Get user task summary
export const getUserTaskSummary = async (userId: string) => {
  try {
    const response = await api.get(`/tasks/user/${userId}/summary/`);
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error('Error fetching user task summary:', error);
    return null;
  }
};

// New: Get pending tasks for user
export const getUserPendingTasks = async (userId: string): Promise<Task[]> => {
  try {
    const response = await api.get(`/tasks/user/${userId}/pending/`);
    return extractTasksFromResponse(response.data);
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    return [];
  }
};

// New: Get overdue tasks for user
export const getUserOverdueTasks = async (userId: string): Promise<Task[]> => {
  try {
    const response = await api.get(`/tasks/user/${userId}/overdue/`);
    return extractTasksFromResponse(response.data);
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    return [];
  }
};

// New: Get high priority tasks for user
export const getUserHighPriorityTasks = async (userId: string): Promise<Task[]> => {
  try {
    const response = await api.get(`/tasks/user/${userId}/high-priority/`);
    return extractTasksFromResponse(response.data);
  } catch (error) {
    console.error('Error fetching high priority tasks:', error);
    return [];
  }
};

// New: Get recent tasks for user
export const getUserRecentTasks = async (userId: string): Promise<Task[]> => {
  try {
    const response = await api.get(`/tasks/user/${userId}/recent/`);
    return extractTasksFromResponse(response.data);
  } catch (error) {
    console.error('Error fetching recent tasks:', error);
    return [];
  }
};

// New: Advanced filter for user tasks
export const filterUserTasks = async (filterOptions: {
  user_id: string;
  include_completed?: boolean;
  project_id?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}): Promise<Task[]> => {
  try {
    const response = await api.post('/tasks/user/filter/', filterOptions);
    return extractTasksFromResponse(response.data);
  } catch (error) {
    console.error('Error filtering user tasks:', error);
    return [];
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

// Updated: Sử dụng API endpoint mới để update status
export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<TaskWithDetails> => {
  try {
    const response = await api.patch(`/tasks/${taskId}/update_status/`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

// Updated: Sử dụng API endpoint mới để update progress
export const updateTaskProgress = async (taskId: string, progress: number): Promise<TaskWithDetails> => {
  try {
    const response = await api.patch(`/tasks/${taskId}/update_progress/`, { progress });
    return response.data;
  } catch (error) {
    console.error('Error updating task progress:', error);
    throw error;
  }
};