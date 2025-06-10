// modules/stacks/types/stacks.ts
// export enum TaskStatus {
//   TODO = 'TODO',
//   IN_PROGRESS = 'IN_PROGRESS',
//   DONE = 'DONE',
// }

// export enum TaskPriority {
//   LOW = 'LOW',
//   MEDIUM = 'MEDIUM',
//   HIGH = 'HIGH',
// }

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

// Comment trong task
export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

// Tệp đính kèm trong task
export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Project {
  id: string;
  name: string;
  members?: TaskAssignee[]; // Thêm danh sách thành viên dự án
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
  category_info?: {
    id?: string;
    name?: string;
    project_id?: string;
};
project_info: {
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
