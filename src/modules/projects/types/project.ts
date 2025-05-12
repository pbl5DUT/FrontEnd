// Type definitions for projects

import { ReactNode } from "react";

export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  TESTING = 'Testing',
  REVIEW = 'Review',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold',
  CANCELLED = 'Cancelled',
}

export interface Enterprise {
  enterprise_id: string;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  industry: string;
  created_at: string;
  updated_at: string;
}

export interface UserInfo {
  id(id: any): number;
  name: ReactNode;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  gender: string;
  birth_date: string;
  phone: string;
  province: string;
  district: string;
  address: string;
  position: string;
  avatar: string | null;
  created_at: string;
  enterprise: Enterprise;
}

export interface ProjectMember {
  role: string;
  id: string;
  user: UserInfo;
  role_in_project: string;
  joined_date: string;
  created_at: string;
}

export interface ProjectTask {
  task_id: string;
  task_name: string;
  description: string;
  status: string;
  priority: string;
  assignee: UserInfo;
  start_date: string;
  due_date: string;
  actual_end_date?: string;
  progress: number;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploaded_by: UserInfo;
  upload_date: string;
  url: string;
}

export interface ProjectComment {
  id: string;
  user: UserInfo;
  content: string;
  date: string;
  attachments?: ProjectFile[];
}

export interface ProjectStats {
  total_tasks: number;
  completed_tasks: number;
  in_progress: number;
  pending_tasks: number;
  delayed_tasks: number;
}

export interface Project {
  project_id: string;
  project_name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  manager: UserInfo;
  progress: number;
  created_at: string;
  updated_at: string;
  members: ProjectMember[];
  tasks?: ProjectTask[];
  files?: ProjectFile[];
  comments?: ProjectComment[];
  stats?: ProjectStats;
}

// Form data type for creating/updating projects

export interface ProjectFormData {
  project_name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  progress: number;
  manager_id: string; // Đổi từ manager thành manager_id để khớp với API
  members?: { // Thêm kiểu dữ liệu cho members
    user_id: string;
    role_in_project: string;
  }[];
}