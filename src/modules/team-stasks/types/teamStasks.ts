// modules/stacks/types/stacks.ts
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGE = 'MANAGE',
  USER = 'USER',
}

// Interface cho người tham gia task
export interface TaskAssignee {
  id: string;
  name: string;
  avatar?: string;
  role?: UserRole;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: TaskAssignee[]; // Nhiều người tham gia
  createdBy: string;
  dueDate: string;
  projectId: string;
  projectName: string;
  comments?: TaskComment[]; // Thêm comments để trao đổi
  attachments?: TaskAttachment[]; // Thêm tệp đính kèm
  createdAt: string;
  updatedAt: string;
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
  members?: TaskAssignee[]; // Thành viên dự án
}
