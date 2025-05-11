// services/taskService.ts (hoặc lib/taskService.ts)
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào header nếu cần
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// API để lấy danh sách categories của một project
export const getTaskCategories = async (projectId: string): Promise<TaskCategory[]> => {
  try {
    const response = await api.get(`/projects/${projectId}/task-categories/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task categories:', error);
    throw error;
  }
};

// API để tạo category mới
export const createTaskCategory = async (projectId: string, categoryData: {
  name: string;
  description?: string;
}): Promise<TaskCategory> => {
  try {
    const response = await api.post(`/projects/${projectId}/task-categories/`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating task category:', error);
    throw error;
  }
};