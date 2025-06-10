// modules/stacks/components/CreateReportForm.tsx - Cải thiện hiển thị Tasks
import React, { useState, useEffect, useCallback } from 'react';
import reportService from '../services/report_service';
import {
  ReportType,
  ReportStatus,
  TaskStatus,
  ReportTask,
  CreateReportRequest,
  generateReportId, // ✅ Import helper function
} from '../types/report';
import styles from '../styles/CreateReportForm.module.css';
import { getTasksByProject } from '@/modules/stacks/services/taskService';
import { Task } from '@/modules/projects/types/Task';
import { fetchUser_Projects } from '@/modules/projects/services/project_service';
import { getCurrentUser } from '@/modules/auth/services/authService';
import { Project } from '@/modules/projects/types/project';

interface CreateReportFormProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onReportCreated: () => void;
}

const CreateReportForm: React.FC<CreateReportFormProps> = ({
  userId,
  userName,
  onClose,
  onReportCreated,
}) => {
  // Form states
  const [formData, setFormData] = useState({
    reportType: ReportType.WEEKLY,
    title: '',
    startDate: '',
    endDate: '',
    selectedProject: '',
    summary: '',
    challenges: '',
    nextSteps: '',
  });

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [taskDetails, setTaskDetails] = useState<Record<string, ReportTask>>({});

  // UI states
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false); // Riêng cho tasks
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [taskLoadError, setTaskLoadError] = useState<string>(''); // Lỗi riêng cho tasks

  // Debug states
  const [debugInfo, setDebugInfo] = useState<{
    lastProjectTried?: string;
    projectsAttempted?: string[];
    taskLoadAttempts?: number;
  }>({});

  // Constants
  const REPORT_TYPES = [
    { id: ReportType.DAILY, label: 'Báo cáo ngày' },
    { id: ReportType.WEEKLY, label: 'Báo cáo tuần' },
    { id: ReportType.MONTHLY, label: 'Báo cáo tháng' },
    { id: ReportType.PROJECT, label: 'Báo cáo dự án' },
  ];

  // Helper functions
  const convertToTaskStatus = (status: string): TaskStatus => {
    const statusMap: Record<string, TaskStatus> = {
      'DONE': TaskStatus.DONE,
      'COMPLETED': TaskStatus.DONE,
      'IN_PROGRESS': TaskStatus.IN_PROGRESS,
      'INPROGRESS': TaskStatus.IN_PROGRESS,
      'PROGRESS': TaskStatus.IN_PROGRESS,
      'TODO': TaskStatus.TODO,
      'PENDING': TaskStatus.TODO,
      'NEW': TaskStatus.TODO,
    };
    return statusMap[status.toUpperCase()] || TaskStatus.TODO;
  };

  const getProgressByStatus = (status: TaskStatus): number => {
    const progressMap: Record<TaskStatus, number> = {
      [TaskStatus.DONE]: 100,
      [TaskStatus.IN_PROGRESS]: 50,
      [TaskStatus.TODO]: 0,
      [TaskStatus.CANCELLED]: 0,
    };
    return progressMap[status];
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().substring(0, 10);
  };

  // Set default dates based on report type
  const setDefaultDates = useCallback(() => {
    const today = new Date();
    let start: Date, end: Date;

    switch (formData.reportType) {
      case ReportType.DAILY:
        start = end = today;
        break;

      case ReportType.WEEKLY:
        start = new Date(today);
        start.setDate(today.getDate() - today.getDay() + 1);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;

      case ReportType.MONTHLY:
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;

      case ReportType.PROJECT:
        start = new Date(today);
        start.setDate(today.getDate() - 30);
        end = today;
        break;

      default:
        start = end = today;
    }

    setFormData(prev => ({
      ...prev,
      startDate: formatDateForInput(start),
      endDate: formatDateForInput(end),
    }));
  }, [formData.reportType]);

  // Generate default title
  const generateDefaultTitle = useCallback(() => {
    if (!formData.startDate || !formData.endDate) return;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const formatDate = (date: Date) => date.toLocaleDateString('vi-VN');

    let title = '';

    switch (formData.reportType) {
      case ReportType.DAILY:
        title = `Báo cáo ngày ${formatDate(start)}`;
        break;
      case ReportType.WEEKLY:
        title = `Báo cáo tuần từ ${formatDate(start)} - ${formatDate(end)}`;
        break;
      case ReportType.MONTHLY:
        title = `Báo cáo tháng ${start.getMonth() + 1}/${start.getFullYear()}`;
        break;
      case ReportType.PROJECT:
        const selectedProject = projects.find(p => p.project_id === formData.selectedProject);
        if (selectedProject) {
          title = `Báo cáo dự án ${selectedProject.project_name} (${formatDate(start)} - ${formatDate(end)})`;
        } else {
          title = `Báo cáo dự án từ ${formatDate(start)} - ${formatDate(end)}`;
        }
        break;
    }

    setFormData(prev => ({ ...prev, title }));
  }, [formData.reportType, formData.startDate, formData.endDate, formData.selectedProject, projects]);

  // Cải thiện hàm load tasks
  const loadTasksForProject = async (projectId: string): Promise<Task[]> => {
    console.log(`🔄 Loading tasks for project: ${projectId}`);
    try {
      const tasks = await getTasksByProject(projectId, userId);
      console.log(`✅ Successfully loaded ${tasks.length} tasks from project ${projectId}`);
      return tasks;
    } catch (error) {
      console.warn(`❌ Failed to load tasks from project ${projectId}:`, error);
      throw error;
    }
  };

  // Cải thiện logic load tasks
  const fetchUserTasks = useCallback(async () => {
    if (!formData.startDate || !formData.endDate || !userId) {
      console.log('❌ Missing required data for task loading:', {
        startDate: formData.startDate,
        endDate: formData.endDate,
        userId
      });
      return;
    }

    if (projects.length === 0) {
      console.log('⏳ Projects not loaded yet, skipping task fetch');
      return;
    }

    setLoadingTasks(true);
    setTaskLoadError('');
    setUserTasks([]);
    setSelectedTasks([]);
    setTaskDetails({});

    const attempts: string[] = [];
    let tasks: Task[] = [];
    let lastError: any = null;

    try {
      console.log('🔍 Starting task fetch process:', {
        reportType: formData.reportType,
        selectedProject: formData.selectedProject,
        userId,
        dateRange: `${formData.startDate} to ${formData.endDate}`,
        availableProjects: projects.map(p => ({ id: p.project_id, name: p.project_name }))
      });

      if (formData.reportType === ReportType.PROJECT) {
        // Cho báo cáo dự án, yêu cầu phải có project được chọn
        if (!formData.selectedProject) {
          setTaskLoadError('Vui lòng chọn dự án để xem danh sách công việc');
          return;
        }
        
        attempts.push(formData.selectedProject);
        tasks = await loadTasksForProject(formData.selectedProject);
      } else {
        // Cho các loại báo cáo khác, thử theo thứ tự ưu tiên
        const projectsToTry: string[] = [];

        // 1. Dự án được chọn (nếu có)
        if (formData.selectedProject) {
          projectsToTry.push(formData.selectedProject);
        }

        // 2. Dự án mặc định
        if (!projectsToTry.includes('prj-10')) {
          projectsToTry.push('prj-10');
        }

        // 3. Các dự án khác
        projects.forEach(project => {
          if (!projectsToTry.includes(project.project_id)) {
            projectsToTry.push(project.project_id);
          }
        });

        console.log('📋 Projects to try (in order):', projectsToTry);

        // Thử từng project cho đến khi tìm thấy tasks
        for (const projectId of projectsToTry) {
          attempts.push(projectId);
          try {
            tasks = await loadTasksForProject(projectId);
            if (tasks.length > 0) {
              console.log(`🎯 Found tasks in project ${projectId}, auto-selecting it`);
              // Auto-select project nếu chưa chọn
              if (!formData.selectedProject) {
                setFormData(prev => ({ ...prev, selectedProject: projectId }));
              }
              break;
            }
          } catch (error) {
            lastError = error;
            console.warn(`⚠️ Project ${projectId} failed:`, error);
          }
        }
      }

      // Update debug info
      setDebugInfo({
        lastProjectTried: attempts[attempts.length - 1],
        projectsAttempted: attempts,
        taskLoadAttempts: attempts.length
      });

      if (tasks.length === 0) {
        const projectName = projects.find(p => p.project_id === formData.selectedProject)?.project_name;
        if (formData.reportType === ReportType.PROJECT && formData.selectedProject) {
          setTaskLoadError(`Không tìm thấy công việc nào trong dự án "${projectName}" cho khoảng thời gian đã chọn.`);
        } else if (attempts.length > 0) {
          setTaskLoadError(`Không tìm thấy công việc nào trong ${attempts.length} dự án đã thử. Thử chọn dự án khác hoặc thay đổi khoảng thời gian.`);
        } else {
          setTaskLoadError('Không có dự án nào để tải công việc.');
        }
      }

      setUserTasks(tasks);
      console.log(`✅ Final result: ${tasks.length} tasks loaded`);

    } catch (error) {
      console.error('❌ Task loading failed:', error);
      setTaskLoadError(
        lastError?.message || 
        'Có lỗi xảy ra khi tải danh sách công việc. Vui lòng thử lại.'
      );
    } finally {
      setLoadingTasks(false);
    }
  }, [userId, formData.startDate, formData.endDate, formData.selectedProject, formData.reportType, projects]);

  // Load initial data
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const currentUser = getCurrentUser();
        const userId = String(currentUser?.user_id || '');
        
        console.log('🏢 Loading projects for user:', userId);
        const projectsData = await fetchUser_Projects(userId);
        
        setProjects(projectsData);
        console.log('📂 Loaded projects:', projectsData.map(p => ({ id: p.project_id, name: p.project_name })));
        
        // Auto-select first project for PROJECT type reports
        if (formData.reportType === ReportType.PROJECT && projectsData.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            selectedProject: projectsData[0].project_id 
          }));
          console.log('🎯 Auto-selected project for PROJECT report:', projectsData[0].project_id);
        }
      } catch (error) {
        console.error('❌ Error fetching projects:', error);
        setErrors(prev => ({ ...prev, general: 'Không thể tải danh sách dự án.' }));
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [formData.reportType]);

  // Load tasks when dependencies change
  useEffect(() => {
    fetchUserTasks();
  }, [fetchUserTasks]);

  // Update dates when report type changes
  useEffect(() => {
    setDefaultDates();
  }, [setDefaultDates]);

  // Update title when relevant fields change
  useEffect(() => {
    generateDefaultTitle();
  }, [generateDefaultTitle]);

  // Form handlers
  const handleInputChange = (field: string, value: string) => {
    console.log(`📝 Form field changed: ${field} = ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    if (!taskId) return;

    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        // Remove task
        setTaskDetails(current => {
          const updated = { ...current };
          delete updated[taskId];
          return updated;
        });
        return prev.filter(id => id !== taskId);
      } else {
        // Add task
        const task = userTasks.find(t => t.task_id === taskId);
        if (!task) return prev;

        try {
          const taskStatus = convertToTaskStatus(task.status || 'TODO');
          const newTaskDetail: ReportTask = {
            task_id: taskId,
            title: task.task_name || 'Untitled Task',
            status: taskStatus,
            progress: task.progress || getProgressByStatus(taskStatus),
            time_spent: 0,
            notes: '',
          };

          setTaskDetails(current => ({
            ...current,
            [taskId]: newTaskDetail,
          }));

          return [...prev, taskId];
        } catch (error) {
          console.error('Error creating task detail:', error);
          return prev;
        }
      }
    });
  };

  const updateTaskDetail = (taskId: string, field: keyof ReportTask, value: any) => {
    if (!taskId || !taskDetails[taskId]) return;

    setTaskDetails(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value,
      },
    }));
  };

  // Retry loading tasks
  const retryLoadTasks = () => {
    console.log('🔄 Retrying task load...');
    fetchUserTasks();
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề báo cáo';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    }

    if (!formData.summary.trim()) {
      newErrors.summary = 'Vui lòng nhập tổng quan báo cáo';
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        newErrors.date = 'Ngày bắt đầu không thể sau ngày kết thúc';
      }
    }

    // Project type validation
    if (formData.reportType === ReportType.PROJECT && !formData.selectedProject) {
      newErrors.project = 'Vui lòng chọn dự án cho báo cáo dự án';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsCreating(true);
      setErrors({});

      // Generate unique report ID using helper function
      const reportId = generateReportId();

      // Prepare API payload
      const payload: CreateReportRequest = {
        id: reportId, // ✅ Add required ID field
        type: formData.reportType,
        title: formData.title.trim(),
        user: userId,
        project: formData.selectedProject || undefined,
        tasks: selectedTasks.length > 0 ? selectedTasks : undefined,
        status: ReportStatus.DRAFT,
        start_date: formData.startDate,
        end_date: formData.endDate,
        summary: formData.summary.trim(),
        challenges: formData.challenges.trim() || undefined,
        next_steps: formData.nextSteps.trim() || undefined,
      };

      // Clean undefined fields
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== undefined)
      ) as CreateReportRequest;

      console.log('🚀 Creating report:', cleanPayload);

      const response = await reportService.createReport(cleanPayload);
      
      console.log('✅ Report created:', response);
      
      onReportCreated();
      onClose();
    } catch (error: any) {
      console.error('❌ Create report error:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi tạo báo cáo. Vui lòng thử lại.';
      
      if (error?.response?.data) {
        const apiError = error.response.data;
        if (apiError.error) {
          errorMessage = apiError.error;
        } else if (apiError.field_errors) {
          const fieldErrors = Object.entries(apiError.field_errors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          errorMessage = `Lỗi validation: ${fieldErrors}`;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Tạo báo cáo mới</h2>
        <button 
          className={styles.closeButton} 
          onClick={onClose} 
          aria-label="Đóng form"
          type="button"
        >
          ×
        </button>
      </div>

      <div className={styles.formContent}>
        {loading ? (
          <div className={styles.loading}>Đang tải dữ liệu...</div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {errors.general && (
              <div className={styles.errorText} style={{ marginBottom: '1rem' }}>
                {errors.general}
              </div>
            )}

            {/* Report Type */}
            <div className={styles.formGroup}>
              <label htmlFor="reportType" className={styles.formLabel}>
                Loại báo cáo *
              </label>
              <select
                id="reportType"
                value={formData.reportType}
                onChange={(e) => handleInputChange('reportType', e.target.value)}
                className={styles.formSelect}
                required
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.formLabel}>
                Tiêu đề báo cáo *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`${styles.formInput} ${errors.title ? styles.inputError : ''}`}
                placeholder="Nhập tiêu đề báo cáo..."
                required
              />
              {errors.title && (
                <div className={styles.errorText}>{errors.title}</div>
              )}
            </div>

            {/* Date Range and Project */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="startDate" className={styles.formLabel}>
                  Từ ngày *
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`${styles.formInput} ${errors.startDate || errors.date ? styles.inputError : ''}`}
                  required
                />
                {errors.startDate && (
                  <div className={styles.errorText}>{errors.startDate}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="endDate" className={styles.formLabel}>
                  Đến ngày *
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`${styles.formInput} ${errors.endDate || errors.date ? styles.inputError : ''}`}
                  required
                />
                {errors.endDate && (
                  <div className={styles.errorText}>{errors.endDate}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="project" className={styles.formLabel}>
                  Dự án {formData.reportType === ReportType.PROJECT ? '*' : '(tùy chọn)'}
                </label>
                <select
                  id="project"
                  value={formData.selectedProject}
                  onChange={(e) => handleInputChange('selectedProject', e.target.value)}
                  className={`${styles.formSelect} ${errors.project ? styles.inputError : ''}`}
                  required={formData.reportType === ReportType.PROJECT}
                >
                  <option value="">-- Chọn dự án --</option>
                  {projects.map((project) => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>
                {errors.project && (
                  <div className={styles.errorText}>{errors.project}</div>
                )}
                {formData.reportType !== ReportType.PROJECT && (
                  <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Chọn dự án để lọc công việc theo dự án cụ thể
                  </small>
                )}
              </div>
            </div>
            
            {errors.date && (
              <div className={styles.errorText} style={{ marginTop: '-16px', marginBottom: '16px' }}>
                {errors.date}
              </div>
            )}

            {/* Task Selection - Cải thiện phần này */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Các công việc
                {loadingTasks && (
                  <span style={{ marginLeft: '8px', color: '#3b82f6', fontSize: '12px' }}>
                    (Đang tải...)
                  </span>
                )}
              </label>

              {/* Debug info trong development */}
              {process.env.NODE_ENV === 'development' && debugInfo.taskLoadAttempts && (
                <div style={{ 
                  background: '#f3f4f6', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  🔧 Debug: Đã thử {debugInfo.taskLoadAttempts} dự án: {debugInfo.projectsAttempted?.join(', ')}
                </div>
              )}

              {loadingTasks ? (
                <div className={styles.loading} style={{ padding: '20px', textAlign: 'center' }}>
                  🔄 Đang tải danh sách công việc...
                </div>
              ) : taskLoadError ? (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '12px',
                  color: '#b91c1c'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    ⚠️ Không thể tải công việc
                  </div>
                  <div style={{ marginBottom: '8px' }}>{taskLoadError}</div>
                  <button
                    type="button"
                    onClick={retryLoadTasks}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Thử lại
                  </button>
                </div>
              ) : userTasks.length === 0 ? (
                <div style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '16px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  {!formData.selectedProject && formData.reportType === ReportType.PROJECT ? (
                    <>
                      📋 Vui lòng chọn dự án trước để xem danh sách công việc
                    </>
                  ) : !formData.selectedProject ? (
                    <>
                      📋 Hệ thống đã tự động tìm kiếm nhưng không tìm thấy công việc nào trong các dự án có sẵn.
                      <br />
                      <small>Thử chọn dự án cụ thể hoặc thay đổi khoảng thời gian</small>
                    </>
                  ) : (
                    <>
                      📋 Không có công việc nào trong dự án "{projects.find(p => p.project_id === formData.selectedProject)?.project_name || formData.selectedProject}" 
                      <br />
                      <small>Khoảng thời gian: {new Date(formData.startDate).toLocaleDateString('vi-VN')} - {new Date(formData.endDate).toLocaleDateString('vi-VN')}</small>
                    </>
                  )}
                  <div style={{ marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={retryLoadTasks}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Tải lại
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ 
                    marginBottom: '12px', 
                    fontSize: '14px', 
                    color: '#16a34a',
                    background: '#f0fdf4',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #bbf7d0'
                  }}>
                    ✅ Tìm thấy {userTasks.length} công việc từ dự án "{projects.find(p => p.project_id === formData.selectedProject)?.project_name || 'Dự án mặc định'}"
                    {selectedTasks.length > 0 && (
                      <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                        - Đã chọn {selectedTasks.length} công việc
                      </span>
                    )}
                  </div>
                  <div className={styles.taskSelectionList}>
                    {userTasks.map((task) => {
                      const taskId = task.task_id;
                      const isSelected = selectedTasks.includes(taskId);
                      const detail = taskDetails[taskId];

                      return (
                        <div
                          key={taskId}
                          className={`${styles.taskSelectionItem} ${isSelected ? styles.selectedTask : ''}`}
                        >
                          <div className={styles.taskCheckbox}>
                            <input
                              type="checkbox"
                              id={`task-${taskId}`}
                              checked={isSelected}
                              onChange={() => toggleTaskSelection(taskId)}
                            />
                            <label htmlFor={`task-${taskId}`}>
                              <strong>{task.task_name}</strong>
                              {task.description && (
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                  {task.description}
                                </div>
                              )}
                              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                                ID: {taskId} | Trạng thái: {task.status}
                              </div>
                            </label>
                          </div>

                          {isSelected && detail && (
                            <div className={styles.taskDetailInputs}>
                              <div className={styles.taskInputRow}>
                                <div className={styles.taskInputGroup}>
                                  <label>Tiến độ (%)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={detail.progress || 0}
                                    onChange={(e) =>
                                      updateTaskDetail(taskId, 'progress', parseInt(e.target.value) || 0)
                                    }
                                    className={styles.taskDetailInput}
                                  />
                                </div>

                                <div className={styles.taskInputGroup}>
                                  <label>Thời gian làm việc (giờ)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={detail.time_spent || 0}
                                    onChange={(e) =>
                                      updateTaskDetail(taskId, 'time_spent', parseFloat(e.target.value) || 0)
                                    }
                                    className={styles.taskDetailInput}
                                  />
                                </div>
                              </div>

                              <div className={styles.taskInputGroup}>
                                <label>Ghi chú</label>
                                <textarea
                                  value={detail.notes || ''}
                                  onChange={(e) => updateTaskDetail(taskId, 'notes', e.target.value)}
                                  className={styles.taskNotesInput}
                                  placeholder="Mô tả công việc đã làm, tiến độ, vấn đề gặp phải..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Summary */}
            <div className={styles.formGroup}>
              <label htmlFor="summary" className={styles.formLabel}>
                Tổng quan *
              </label>
              <textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                className={`${styles.formTextarea} ${errors.summary ? styles.inputError : ''}`}
                placeholder="Tóm tắt những công việc đã thực hiện, tiến độ chung..."
                rows={4}
                required
              />
              {errors.summary && (
                <div className={styles.errorText}>{errors.summary}</div>
              )}
            </div>

            {/* Challenges */}
            <div className={styles.formGroup}>
              <label htmlFor="challenges" className={styles.formLabel}>
                Thách thức & khó khăn
              </label>
              <textarea
                id="challenges"
                value={formData.challenges}
                onChange={(e) => handleInputChange('challenges', e.target.value)}
                className={styles.formTextarea}
                placeholder="Những khó khăn, thách thức gặp phải trong quá trình làm việc..."
                rows={3}
              />
            </div>

            {/* Next Steps */}
            <div className={styles.formGroup}>
              <label htmlFor="nextSteps" className={styles.formLabel}>
                Kế hoạch tiếp theo
              </label>
              <textarea
                id="nextSteps"
                value={formData.nextSteps}
                onChange={(e) => handleInputChange('nextSteps', e.target.value)}
                className={styles.formTextarea}
                placeholder="Những việc sẽ thực hiện trong thời gian tới..."
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onClose}
                disabled={isCreating}
              >
                Hủy
              </button>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isCreating || loading || loadingTasks}
              >
                {isCreating ? 'Đang tạo...' : 'Tạo báo cáo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default CreateReportForm;