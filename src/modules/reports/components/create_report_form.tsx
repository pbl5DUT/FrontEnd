// modules/stacks/components/CreateReportForm.tsx - Refactored & Improved
import React, { useState, useEffect, useCallback } from 'react';
import reportService from '../services/report_service';
import {
  ReportType,
  ReportStatus,
  TaskStatus,
  
  ReportTask,
  CreateReportRequest,
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
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      [TaskStatus.CANCELLED]: 0, // Add mapping for CANCELLED status
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
        start.setDate(today.getDate() - today.getDay() + 1); // Monday
        end = new Date(start);
        end.setDate(start.getDate() + 6); // Sunday
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

  // Load initial data
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const currentUser = getCurrentUser();
      const userId = String(currentUser?.user_id || '');
      
      // TODO: Replace with actual API call when available
      const projectsData = await fetchUser_Projects(userId);
        
        // For now, use mock data - you can replace this with real API
        // const mockProjects: Project[] = [
        //   { id: 'proj-1', name: 'Dự án Website' },
        //   { id: 'proj-2', name: 'Dự án Mobile App' },
        //   { id: 'prj-10', name: 'Project Management System' },
        //   { id: 'prj-11', name: 'E-commerce Platform' },
        //   { id: 'prj-12', name: 'Mobile Banking App' },
        // ];
        
        setProjects(projectsData);
        // console.log('📂 Loaded projects:', mockProjects);
        
        // Auto-select first project for PROJECT type reports
        if (formData.reportType === ReportType.PROJECT && projectsData.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            selectedProject: projectsData[0].project_id 
          }));
          console.log('🎯 Auto-selected project for PROJECT report:', projectsData[0].project_id);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setErrors(prev => ({ ...prev, general: 'Không thể tải danh sách dự án.' }));
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [formData.reportType]);

  // Load tasks when dates or project change
  useEffect(() => {
    if (!formData.startDate || !formData.endDate || !userId) return;

    const fetchTasks = async () => {
      try {
        let tasks: Task[] = [];
        
        console.log('🔍 Fetching tasks for:', {
          reportType: formData.reportType,
          selectedProject: formData.selectedProject,
          userId,
          dateRange: `${formData.startDate} to ${formData.endDate}`
        });
        
        if (formData.reportType === ReportType.PROJECT) {
          // For project reports, require a selected project
          if (!formData.selectedProject) {
            console.log('⚠️ No project selected for PROJECT report');
            setUserTasks([]);
            return;
          }
          console.log('📋 Loading tasks from selected project:', formData.selectedProject);
          tasks = await getTasksByProject(formData.selectedProject, userId);
        } else {
          // For other report types, try to get tasks
          if (formData.selectedProject) {
            console.log('📋 Loading tasks from selected project:', formData.selectedProject);
            tasks = await getTasksByProject(formData.selectedProject, userId);
          } else {
            // Try to get tasks from default project first
            try {
              console.log('📋 Loading tasks from default project: prj-10');
              tasks = await getTasksByProject('prj-10', userId);
            } catch (error) {
              console.warn('Could not load from default project, trying other projects...');
              // If default project fails, try other available projects
              for (const project of projects) {
                try {
                  console.log(`📋 Trying project: ${project.project_id} (${project.project_name})`);
                  tasks = await getTasksByProject(project.project_id, userId);
                  if (tasks.length > 0) {
                    console.log(`✅ Found ${tasks.length} tasks in project ${project.project_id}`);
                    // Auto-select this project since it has tasks
                    setFormData(prev => ({ ...prev, selectedProject: project.project_id }));
                    break;
                  }
                } catch (projectError) {
                  console.warn(`❌ Failed to load tasks from project ${project.project_id}:`, projectError);
                }
              }
              
              // If no projects have tasks, create mock tasks for testing
              if (tasks.length === 0) {
                console.warn('⚠️ No tasks found from any project, creating mock tasks for testing...');
                tasks = [
                  {
                    task_id: 'mock-task-1',
                    task_name: 'Phát triển tính năng đăng nhập',
                    description: 'Tạo form đăng nhập với validation',
                    status: 'IN_PROGRESS',
                    progress: 75,
                    priority: 'HIGH',
                    start_date: formData.startDate,
                    due_date: formData.endDate,
                    project_id: 'prj-10',
                    assigned_to: userId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  {
                    task_id: 'mock-task-2',
                    task_name: 'Thiết kế giao diện dashboard',
                    description: 'Tạo layout và components cho dashboard',
                    status: 'TODO',
                    progress: 25,
                    priority: 'MEDIUM',
                    start_date: formData.startDate,
                    due_date: formData.endDate,
                    project_id: 'prj-10',
                    assigned_to: userId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  {
                    task_id: 'mock-task-3',
                    task_name: 'API integration cho báo cáo',
                    description: 'Kết nối frontend với backend API',
                    status: 'DONE',
                    progress: 100,
                    priority: 'HIGH',
                    start_date: formData.startDate,
                    due_date: formData.endDate,
                    project_id: 'prj-10',
                    assigned_to: userId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                ] as unknown as Task[];
                console.log('✅ Created mock tasks for testing:', tasks);
              }
            }
          }
        }
        
        console.log(`✅ Successfully loaded ${tasks.length} tasks for user ${userId}`);
        setUserTasks(tasks);
        setSelectedTasks([]);
        setTaskDetails({});
      } catch (error) {
        console.error('❌ Error fetching tasks:', error);
        setUserTasks([]);
      }
    };

    // Only fetch tasks if we have projects loaded
    if (projects.length > 0) {
      fetchTasks();
    }
  }, [userId, formData.startDate, formData.endDate, formData.selectedProject, formData.reportType, projects]);

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

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validation
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

    // Task validation - only require tasks if some are available
    if (userTasks.length > 0 && selectedTasks.length === 0) {
      newErrors.tasks = 'Vui lòng chọn ít nhất một công việc';
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

      // Prepare API payload
      const payload: CreateReportRequest = {
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

              {/* Project Selection - Show for all report types but only require for PROJECT type */}
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

            {/* Task Selection */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Các công việc {userTasks.length > 0 ? '*' : ''}
              </label>
              {userTasks.length === 0 ? (
                <div className={styles.noTasks}>
                  {!formData.selectedProject && formData.reportType === ReportType.PROJECT ? (
                    <>
                      📋 Vui lòng chọn dự án trước để xem danh sách công việc
                    </>
                  ) : !formData.selectedProject ? (
                    <>
                      📋 Chọn dự án để xem công việc cụ thể hoặc hệ thống sẽ tự động tải công việc từ dự án mặc định
                    </>
                  ) : (
                    <>
                      📋 Không có công việc nào trong dự án "{projects.find(p => p.project_id === formData.selectedProject)?.project_name || formData.selectedProject}" 
                      trong khoảng thời gian từ {new Date(formData.startDate).toLocaleDateString('vi-VN')} 
                      đến {new Date(formData.endDate).toLocaleDateString('vi-VN')}
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ 
                    marginBottom: '12px', 
                    fontSize: '14px', 
                    color: '#6b7280',
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    📊 Tìm thấy {userTasks.length} công việc từ dự án "{projects.find(p => p.project_id === formData.selectedProject)?.project_name || 'Dự án mặc định'}"
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
                  {errors.tasks && (
                    <div className={styles.errorText}>{errors.tasks}</div>
                  )}
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
                disabled={isCreating || loading}
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