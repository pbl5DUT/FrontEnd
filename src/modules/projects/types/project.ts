// Type definitions for projects

export enum ProjectStatus {
  PLANNING = 'Chuẩn bị',
  IN_PROGRESS = 'Phát triển',
  TESTING = 'Kiểm thử',
  REVIEW = 'Kiểm duyệt',
  COMPLETED = 'Đóng',
  ON_HOLD = 'Tạm dừng',
  CANCELLED = 'Hủy bỏ',
}

export interface UserInfo {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar: string | null;
}

export interface ProjectMember {
  user: UserInfo;
  role_in_project: string;
  joined_date?: string;
}

export interface ProjectTask {
  task_id: string;
  task_name: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
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
  uploaded_by: string;
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
  start_date: string;
  end_date: string;
  status: ProjectStatus | string;
  progress: number;
  manager: string;
  members: ProjectMember[];
  tasks?: ProjectTask[];
  files?: ProjectFile[];
  comments?: ProjectComment[];
  stats?: ProjectStats;
  created_at: string;
  updated_at: string;
}

export interface UserInfo {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar: string | null;
}

export interface ProjectMember {
  user: UserInfo;
  role_in_project: string;
  joined_date?: string;
}

export interface ProjectTask {
  task_id: string;
  task_name: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
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
  uploaded_by: string;
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
  start_date: string;
  end_date: string;
  status: ProjectStatus | string;
  progress: number;
  manager: string;
  members: ProjectMember[];
  tasks?: ProjectTask[];
  files?: ProjectFile[];
  comments?: ProjectComment[];
  stats?: ProjectStats;
  created_at: string;
  updated_at: string;
}

// Form data type for creating/updating projects
export interface ProjectFormData {
  project_name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  progress: number;
  manager: string;
  members?: ProjectMember[];
}
