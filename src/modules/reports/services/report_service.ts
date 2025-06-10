// modules/stacks/services/reportService.ts - ✅ Aligned with BE WorkReportViewSet
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  WorkReport,
  ReportType,
  ReportStatus,
  PaginatedResponse,
  ReportStatistics,
  TaskForReporting,
} from '../types/report';

// Define backend payload interfaces for type safety
interface CreateReportPayload {
  type: ReportType;
  title: string;
  user: string; // user_id
  project?: string; // project_id
  tasks?: string[]; // task_ids
  status?: ReportStatus;
  start_date: string;
  end_date: string;
  summary: string;
  challenges?: string;
  next_steps?: string;
}

interface UpdateReportPayload {
  type?: ReportType;
  title?: string;
  user?: string;
  project?: string;
  tasks?: string[];
  status?: ReportStatus;
  start_date?: string;
  end_date?: string;
  summary?: string;
  challenges?: string;
  next_steps?: string;
}

interface ReportTasksResponse {
  report_id: string;
  report_title: string;
  tasks_count: number;
  tasks: Array<{ task_id: string; task_name: string; description?: string; status?: string; priority?: string; progress?: number; time_spent?: number }>;
}

interface TaskActionResponse {
  message: string;
  tasks_count: number;
}

// Create axios instance with timeout
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10-second timeout
});

// Validate environment variable in production
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set in production environment');
}

// Add interceptor to auto-add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && typeof token === 'string' && token.trim()) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Unknown API error';
    return Promise.reject(new Error(message));
  }
);

// Normalize response data
const normalizeResponse = <T>(response: AxiosResponse): T => {
  return response.data.data || response.data;
};

class ReportService {
  /**
   * Get all reports for a user
   * @param userId User ID
   * @returns Array of WorkReport
   */
  async getUserReports(userId: string): Promise<WorkReport[]> {
    if (!userId) throw new Error('userId is required');
    const response = await api.get('/workreports/', { params: { user_id: userId } });
    return normalizeResponse<WorkReport[]>(response) || [];
  }

  /**
   * Get reports with filters and pagination
   * @param userId User ID (optional)
   * @param filters Filters and pagination options
   * @returns Paginated response of WorkReport
   */
  async getUserReportsWithFilters(
    userId?: string,
    filters?: {
      status?: ReportStatus;
      type?: ReportType;
      project_id?: string;
      page?: number;
      page_size?: number;
    }
  ): Promise<PaginatedResponse<WorkReport>> {
    const params: Record<string, any> = {};
    if (userId) params.user_id = userId;
    if (filters?.status) params.status = filters.status;
    if (filters?.type) params.type = filters.type;
    if (filters?.project_id) params.project_id = filters.project_id;
    if (filters?.page) params.page = filters.page;
    if (filters?.page_size) params.page_size = filters.page_size;

    const response = await api.get('/workreports/', { params });
    return normalizeResponse<PaginatedResponse<WorkReport>>(response);
  }

  /**
   * Get report by ID
   * @param reportId Report ID
   * @returns WorkReport or null if not found
   */
  async getReportById(reportId: string): Promise<WorkReport | null> {
    if (!reportId) throw new Error('reportId is required');
    try {
      const response = await api.get(`/workreports/${reportId}/`);
      return normalizeResponse<WorkReport>(response);
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  /**
   * Create a new report
   * @param reportData Report data
   * @returns Created WorkReport
   */
  async createReport(
    reportData: Omit<WorkReport, 'id' | 'created_at' | 'updated_at'> | CreateReportPayload
  ): Promise<WorkReport> {
    const createData: CreateReportPayload = 'user_id' in reportData
      ? (reportData as CreateReportPayload)
      : {
          type: reportData.type,
          title: reportData.title,
          user: (reportData.user as any)?.user_id || reportData.user,
          project: (reportData.project as any)?.project_id,
          tasks: reportData.tasks?.map((task) => (task as any).task_id || task),
          status: reportData.status || ReportStatus.DRAFT,
          start_date: reportData.start_date,
          end_date: reportData.end_date,
          summary: reportData.summary,
          challenges: reportData.challenges,
          next_steps: reportData.next_steps,
        };

    // Validate required fields
    if (!createData.title || !createData.user || !createData.start_date || !createData.end_date || !createData.summary) {
      throw new Error('Missing required fields: title, user, start_date, end_date, summary');
    }

    // Remove undefined/null values
    Object.keys(createData).forEach((key) => {
      if (createData[key as keyof CreateReportPayload] === undefined || createData[key as keyof CreateReportPayload] === null) {
        delete createData[key as keyof CreateReportPayload];
      }
    });

    const response = await api.post('/workreports/', createData);
    return normalizeResponse<WorkReport>(response);
  }

  /**
   * Update a report
   * @param reportId Report ID
   * @param reportData Partial report data
   * @returns Updated WorkReport
   */
  async updateReport(reportId: string, reportData: Partial<WorkReport> | UpdateReportPayload): Promise<WorkReport> {
    if (!reportId) throw new Error('reportId is required');
    const updateData: UpdateReportPayload = 'user_id' in reportData
      ? (reportData as UpdateReportPayload)
      : {
          type: reportData.type,
          title: reportData.title,
          user: (reportData.user as any)?.user_id,
          project: (reportData.project as any)?.project_id,
          tasks: reportData.tasks?.map((task) => (task as any).task_id || task),
          status: reportData.status,
          start_date: reportData.start_date,
          end_date: reportData.end_date,
          summary: reportData.summary,
          challenges: reportData.challenges,
          next_steps: reportData.next_steps,
        };

    // Remove undefined/null values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof UpdateReportPayload] === undefined || updateData[key as keyof UpdateReportPayload] === null) {
        delete updateData[key as keyof UpdateReportPayload];
      }
    });

    const response = await api.patch(`/workreports/${reportId}/`, updateData);
    return normalizeResponse<WorkReport>(response);
  }

  /**
   * Submit a report for review
   * @param reportId Report ID
   * @returns Updated WorkReport
   */
  async submitReport(reportId: string): Promise<WorkReport> {
    if (!reportId) throw new Error('reportId is required');
    const response = await api.post(`/workreports/${reportId}/submit/`, {});
    return normalizeResponse<WorkReport>(response);
  }

  /**
   * Review a report
   * @param reportId Report ID
   * @param reviewerId Reviewer ID
   * @param reviewComment Optional review comment
   * @returns Updated WorkReport
   */
  async reviewReport(reportId: string, reviewerId: string, reviewComment?: string): Promise<WorkReport> {
    if (!reportId || !reviewerId) throw new Error('reportId and reviewerId are required');
    const requestData: { review_comment?: string } = reviewComment ? { review_comment: reviewComment } : {};
    const response = await api.post(`/workreports/${reportId}/review/`, requestData);
    return normalizeResponse<WorkReport>(response);
  }

  /**
   * Reject a report
   * @param reportId Report ID
   * @param rejectReason Reason for rejection
   * @returns Updated WorkReport
   */
  async rejectReport(reportId: string, rejectReason: string): Promise<WorkReport> {
    if (!reportId || !rejectReason) throw new Error('reportId and rejectReason are required');
    const response = await api.post(`/workreports/${reportId}/reject/`, { reject_reason: rejectReason });
    return normalizeResponse<WorkReport>(response);
  }

  /**
   * Delete a report
   * @param reportId Report ID
   */
  async deleteReport(reportId: string): Promise<void> {
    if (!reportId) throw new Error('reportId is required');
    await api.delete(`/workreports/${reportId}/`);
  }

  /**
   * Get reports for the authenticated user
   * @param filters Optional filters
   * @returns Paginated response of WorkReport
   */
  async getMyReports(filters?: {
    status?: ReportStatus;
    type?: ReportType;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<WorkReport>> {
    const params: Record<string, any> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.type) params.type = filters.type;
    if (filters?.page) params.page = filters.page;
    if (filters?.page_size) params.page_size = filters.page_size;

    const response = await api.get('/workreports/my_reports/', { params });
    return normalizeResponse<PaginatedResponse<WorkReport>>(response);
  }

  /**
   * Get report statistics
   * @param userId Optional user ID
   * @param projectId Optional project ID
   * @returns Report statistics
   */
  async getStatistics(userId?: string, projectId?: string): Promise<ReportStatistics> {
    const params: Record<string, any> = {};
    if (userId) params.user_id = userId;
    if (projectId) params.project_id = projectId;

    const response = await api.get('/workreports/statistics/', { params });
    return normalizeResponse<ReportStatistics>(response);
  }

  /**
   * Get user tasks for reporting
   * @param userId User ID
   * @param startDate Start date
   * @param endDate End date
   * @param projectId Optional project ID
   * @returns Array of TaskForReporting
   */
  async getUserTasksForReporting(userId: string, startDate: string, endDate: string, projectId?: string): Promise<TaskForReporting[]> {
    if (!userId || !startDate || !endDate) throw new Error('userId, startDate, and endDate are required');
    const params: Record<string, any> = {
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
      project_id: projectId,
    };

    try {
      const response = await api.get('/workreports/user_tasks_for_reporting/', { params });
      return normalizeResponse<TaskForReporting[]>(response) || [];
    } catch (error: any) {
      if (error.response?.status === 404) return [];
      throw error;
    }
  }

  /**
   * Get available report types (static data)
   * @returns Array of report types
   */
  async getReportTypes(): Promise<{ id: ReportType; label: string }[]> {
    return [
      { id: ReportType.DAILY, label: 'Báo cáo ngày' },
      { id: ReportType.WEEKLY, label: 'Báo cáo tuần' },
      { id: ReportType.MONTHLY, label: 'Báo cáo tháng' },
      { id: ReportType.PROJECT, label: 'Báo cáo dự án' },
    ];
  }

  /**
   * Get tasks for a report
   * @param reportId Report ID
   * @returns Report tasks response
   */
  async getReportTasks(reportId: string): Promise<ReportTasksResponse> {
    if (!reportId) throw new Error('reportId is required');
    const response = await api.get(`/workreports/${reportId}/tasks/`);
    return normalizeResponse<ReportTasksResponse>(response);
  }

  /**
   * Add a task to a report
   * @param reportId Report ID
   * @param taskId Task ID
   * @returns Task action response
   */
  async addTaskToReport(reportId: string, taskId: string): Promise<TaskActionResponse> {
    if (!reportId || !taskId) throw new Error('reportId and taskId are required');
    const response = await api.post(`/workreports/${reportId}/tasks/`, { task_id: taskId });
    return normalizeResponse<TaskActionResponse>(response);
  }

  /**
   * Remove a task from a report
   * @param reportId Report ID
   * @param taskId Task ID
   * @returns Task action response
   */
  async removeTaskFromReport(reportId: string, taskId: string): Promise<TaskActionResponse> {
    if (!reportId || !taskId) throw new Error('reportId and taskId are required');
    const response = await api.delete(`/workreports/${reportId}/tasks/`, { params: { task_id: taskId } });
    return normalizeResponse<TaskActionResponse>(response);
  }

  /**
   * Quick create report with simplified format
   * @param data Simplified report data
   * @returns Created WorkReport
   */
  async quickCreateReport(data: {
    type: ReportType;
    title: string;
    user_id: string;
    project_id?: string;
    task_ids?: string[];
    start_date: string;
    end_date: string;
    summary: string;
    challenges?: string;
    next_steps?: string;
  }): Promise<WorkReport> {
    return this.createReport({
      type: data.type,
      title: data.title,
      user: data.user_id,
      project: data.project_id,
      tasks: data.task_ids,
      start_date: data.start_date,
      end_date: data.end_date,
      summary: data.summary,
      challenges: data.challenges,
      next_steps: data.next_steps,
      status: ReportStatus.DRAFT,
    });
  }

  /**
   * Search reports
   * @param query Search query
   * @param filters Optional filters
   * @returns Paginated response of WorkReport
   */
  async searchReports(
    query: string,
    filters?: {
      user_id?: string;
      status?: ReportStatus;
      type?: ReportType;
      project_id?: string;
    }
  ): Promise<PaginatedResponse<WorkReport>> {
    const params: Record<string, any> = { search: query };
    if (filters?.user_id) params.user_id = filters.user_id;
    if (filters?.status) params.status = filters.status;
    if (filters?.type) params.type = filters.type;
    if (filters?.project_id) params.project_id = filters.project_id;

    const response = await api.get('/workreports/', { params });
    return normalizeResponse<PaginatedResponse<WorkReport>>(response);
  }

  /**
   * Get workflow status counts
   * @returns Workflow statistics
   */
  async getWorkflowStats(): Promise<{
    draft: number;
    submitted: number;
    reviewed: number;
    total: number;
  }> {
    try {
      const stats = await this.getStatistics();
      return {
        draft: stats.summary.draft || 0,
        submitted: stats.summary.submitted || 0,
        reviewed: stats.summary.reviewed || 0,
        total: stats.total_reports || 0,
      };
    } catch (error) {
      return { draft: 0, submitted: 0, reviewed: 0, total: 0 };
    }
  }
}

export default new ReportService();