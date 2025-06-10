// modules/stacks/services/reportService.ts - ✅ Fixed to match exact API format
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  WorkReport,
  ReportType,
  ReportStatus,
  PaginatedResponse,
  ReportStatistics,
  TaskForReporting,
  CreateReportRequest, // Use the correct interface
} from '../types/report';

// ✅ Updated to match EXACT API format
interface CreateReportPayload {
  id?: string;                    // Optional - backend generates
  type: ReportType;
  title: string;
  user: string;                   // user_id
  project?: string;               // project_id (optional)
  tasks?: string[];               // task_ids array (optional)
  status?: ReportStatus;          // Default: DRAFT
  start_date: string;             // YYYY-MM-DD
  end_date: string;               // YYYY-MM-DD
  submitted_date?: string | null; // ISO string or null
  reviewed_date?: string | null;  // ISO string or null
  reviewed_by?: string | null;    // user_id or null
  summary: string;
  challenges?: string;            // Optional
  next_steps?: string;            // Optional
  created_at?: string;            // Optional - backend sets
  updated_at?: string;            // Optional - backend sets
}

interface UpdateReportPayload extends Partial<CreateReportPayload> {
  id?: string; // For updates
}

interface ReportTasksResponse {
  report_id: string;
  report_title: string;
  tasks_count: number;
  tasks: Array<{ 
    task_id: string; 
    task_name: string; 
    description?: string; 
    status?: string; 
    priority?: string; 
    progress?: number; 
    time_spent?: number; 
  }>;
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

// ✅ Better response normalization
const normalizeResponse = <T>(response: AxiosResponse): T => {
  // Handle both paginated and direct responses
  return response.data.data || response.data.results || response.data;
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
    
    // Handle both array and paginated response
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    } else if (data.results) {
      return data.results;
    }
    return data.data || [];
  }

  /**
   * ✅ Fixed: Get reports with filters and pagination
   * Handle both array and paginated responses from backend
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
  ): Promise<WorkReport[] | PaginatedResponse<WorkReport>> {
    const params: Record<string, any> = {};
    if (userId) params.user_id = userId;
    if (filters?.status) params.status = filters.status;
    if (filters?.type) params.type = filters.type;
    if (filters?.project_id) params.project_id = filters.project_id;
    if (filters?.page) params.page = filters.page;
    if (filters?.page_size) params.page_size = filters.page_size;

    const response = await api.get('/workreports/', { params });
    
    // Return the actual response format from backend
    const data = response.data;
    
    // If it's a paginated response
    if (data.results !== undefined) {
      return {
        count: data.count || 0,
        next: data.next || null,
        previous: data.previous || null,
        results: data.results || []
      };
    }
    
    // If it's a simple array
    if (Array.isArray(data)) {
      return data;
    }
    
    // Fallback
    return [];
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
   * ✅ FIXED: Simplified createReport method
   * Accept CreateReportRequest and send directly to API
   */
  async createReport(reportData: CreateReportRequest): Promise<WorkReport> {
    // Validate required fields
    if (!reportData.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!reportData.user) {
      throw new Error('User is required');
    }
    if (!reportData.start_date) {
      throw new Error('Start date is required');
    }
    if (!reportData.end_date) {
      throw new Error('End date is required');
    }
    if (!reportData.summary?.trim()) {
      throw new Error('Summary is required');
    }

    // Clean the payload - remove undefined values
    const cleanPayload: CreateReportPayload = {
      ...reportData,
      // Ensure required fields have default values
      status: reportData.status || ReportStatus.DRAFT,
    //   submitted_date: reportData.submitted_date || null,
    //   reviewed_date: reportData.reviewed_date || null,
    //   reviewed_by: reportData.reviewed_by || null,
    };

    // Remove undefined/null fields except those that should be explicitly null
    const finalPayload = Object.fromEntries(
      Object.entries(cleanPayload).filter(([key, value]) => {
        // Keep these fields even if null
        const keepNullFields = ['submitted_date', 'reviewed_date', 'reviewed_by'];
        if (keepNullFields.includes(key)) {
          return true;
        }
        // Remove undefined values, but keep empty strings and 0
        return value !== undefined;
      })
    );

    console.log('📤 Sending to API:', finalPayload);

    try {
      const response = await api.post('/workreports/', finalPayload);
      console.log('📥 API Response:', response.data);
      return normalizeResponse<WorkReport>(response);
    } catch (error: any) {
      console.error('❌ API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update a report
   * @param reportId Report ID
   * @param reportData Partial report data
   * @returns Updated WorkReport
   */
  async updateReport(reportId: string, reportData: Partial<CreateReportRequest>): Promise<WorkReport> {
    if (!reportId) throw new Error('reportId is required');

    // Clean the payload
    const cleanPayload = Object.fromEntries(
      Object.entries(reportData).filter(([_, value]) => value !== undefined)
    );

    const response = await api.patch(`/workreports/${reportId}/`, cleanPayload);
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
   * ✅ UPDATED: Get user tasks for reporting
   * Falls back to existing task service if report-specific endpoint doesn't exist
   */
  async getUserTasksForReporting(
    userId: string, 
    startDate: string, 
    endDate: string, 
    projectId?: string
  ): Promise<TaskForReporting[]> {
    if (!userId || !startDate || !endDate) {
      throw new Error('userId, startDate, and endDate are required');
    }

    const params: Record<string, any> = {
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
    };
    if (projectId) params.project_id = projectId;

    try {
      // Try the report-specific endpoint first
      const response = await api.get('/workreports/user_tasks_for_reporting/', { params });
      return normalizeResponse<TaskForReporting[]>(response) || [];
    } catch (error: any) {
      console.warn('Report-specific task endpoint not available, using fallback');
      
      // Fallback to generic task endpoint if available
      try {
        // This should match your existing task service
        const fallbackResponse = await api.get('/tasks/', { params });
        const tasks = normalizeResponse<any[]>(fallbackResponse) || [];
        
        // Transform generic tasks to TaskForReporting format
        return tasks.map(task => ({
          task_id: task.task_id || task.id,
          task_name: task.task_name || task.name || task.title,
          description: task.description || '',
          status: task.status || 'TODO',
          priority: task.priority || 'MEDIUM',
          start_date: task.start_date || startDate,
          due_date: task.due_date || endDate,
          progress: task.progress || 0,
          time_spent: task.time_spent || 0,
          updated_at: task.updated_at || new Date().toISOString(),
          project: {
            project_id: task.project_id || projectId || '',
            project_name: task.project_name || 'Unknown Project'
          }
        }));
      } catch (fallbackError) {
        console.error('Both task endpoints failed:', fallbackError);
        return [];
      }
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
    const response = await api.delete(`/workreports/${reportId}/tasks/`, { 
      params: { task_id: taskId } 
    });
    return normalizeResponse<TaskActionResponse>(response);
  }

  /**
   * ✅ NEW: Quick create method with simplified interface
   * Perfect for CreateReportForm usage
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
    const createRequest: CreateReportRequest = {
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
    //   submitted_date: null,
    //   reviewed_date: null,
    //   reviewed_by: null,
    };

    return this.createReport(createRequest);
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

  /**
   * ✅ NEW: Validate report data before submission
   */
  validateReportData(data: CreateReportRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title?.trim()) errors.push('Title is required');
    if (!data.user) errors.push('User is required');
    if (!data.start_date) errors.push('Start date is required');
    if (!data.end_date) errors.push('End date is required');
    if (!data.summary?.trim()) errors.push('Summary is required');

    // Date validation
    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      if (start > end) {
        errors.push('Start date cannot be after end date');
      }
    }

    // Project validation for PROJECT type
    if (data.type === ReportType.PROJECT && !data.project) {
      errors.push('Project is required for PROJECT type reports');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new ReportService();