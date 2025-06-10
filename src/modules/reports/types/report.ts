// modules/stacks/types/report.ts - ✅ Follow BE Format

import { TaskStatus } from '../../stacks/types/stacks';


export enum ReportType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  PROJECT = 'PROJECT',
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
}

// ✅ MAIN: Sử dụng trực tiếp BE format
export interface WorkReport {
  id: string;
  type: ReportType;
  title: string;
  user: {
    user_id: string;
    username: string;
    full_name: string;
    email: string;
  } | null;
  project: {
    project_id: string;
    project_name: string;
    status: string;
  } | null;
  tasks: Array<{
    task_id: string;
    task_name: string;
    status: string;
    description?: string;
    progress?: number;
    time_spent?: number;
    notes?: string;
  }>;
  status: ReportStatus;
  start_date: string;  // BE format: YYYY-MM-DD
  end_date: string;    // BE format: YYYY-MM-DD
  submitted_date?: string | null;
  reviewed_date?: string | null;
  reviewed_by?: string | null;
  summary: string;
  challenges?: string;
  next_steps?: string;
  created_at: string;
  updated_at: string;
}

// ✅ Create request format (gửi lên BE)
export interface CreateReportRequest {
  id?: string;
  type: ReportType;
  title: string;
  user: string;        // user_id
  project?: string;    // project_id
  tasks?: string[];    // task_ids array
  status?: ReportStatus;
  start_date: string;  // YYYY-MM-DD
  end_date: string;    // YYYY-MM-DD
  summary: string;
  challenges?: string;
  next_steps?: string;
}

// ✅ Update request format
export interface UpdateReportRequest extends Partial<CreateReportRequest> {}

// ✅ API Response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ActionResponse<T> {
  message: string;
  data: T;
  submit_info?: any;
  review_info?: any;
  reject_info?: any;
}

export interface ReportStatistics {
  total_reports: number;
  status_breakdown: Array<{ status: string; count: number }>;
  type_breakdown: Array<{ type: string; count: number }>;
  summary: {
    draft: number;
    submitted: number;
    reviewed: number;
  };
  type_summary: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

// ✅ Task for reporting (BE cần thêm endpoint này)
export interface TaskForReporting {
  task_id: string;
  task_name: string;
  description: string;
  status: string;
  priority: string;
  start_date: string;
  due_date: string;
  progress: number;
  time_spent: number;
  updated_at: string;
  project: {
    project_id: string;
    project_name: string;
  };
}
export interface ReportTask {
  task_id: string;
  title: string;
  status: TaskStatus;
  progress: number;
  time_spent: number;
  notes?: string;
}
export { TaskStatus, type Project, type Task } from '../../stacks/types/stacks';