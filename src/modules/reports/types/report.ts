// modules/stacks/types/report.ts
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

export interface ReportTask {
  taskId: string;
  title: string;
  status: TaskStatus;
  progress: number; // Phần trăm hoàn thành (0-100)
  timeSpent: number; // Số giờ đã làm việc
  notes: string; // Ghi chú về công việc
}

export interface WorkReport {
  id: string;
  type: ReportType;
  title: string;
  userId: string;
  userName: string;
  status: ReportStatus;
  projectId?: string;
  projectName?: string;
  startDate: string;
  endDate: string;
  submittedDate?: string;
  reviewedDate?: string;
  reviewedBy?: string;
  reportTasks: ReportTask[];
  summary: string;
  challenges?: string;
  nextSteps?: string;
  createdAt: string;
  updatedAt: string;
}

export { TaskStatus, type Project, type Task } from '../../stacks/types/stacks';
