import React, { useState, useEffect } from 'react';

// ===== INTERFACES =====
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
  user_name: string;
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
  url: string;
  file_type: string;
  file_size: string;
  uploaded_by: string;
  upload_date: string;
  size: number;
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
  assignees?: TaskAssignee[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
}

export interface TaskWithDetails extends Task {
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  assignees?: TaskAssignee[];
}

// ===== INTERFACES CHO TIMELINE =====
export interface CategoryData {
  id: string;
  name: string;
  project_id: string;
  tasks_count: number;
  completed_tasks_count: number;
}

export interface TaskData {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  start_date: string; // DD/MM/YYYY format
  due_date: string; // DD/MM/YYYY format
  status: 'Todo' | 'In Progress' | 'Done' | 'Cancelled' | 'Review';
  assignees: any[];
}

interface ProjectTimelineProps {
  projectId: string;
  projectStartDate: string;
  projectEndDate: string;
  categories: CategoryData[];
  tasks: TaskData[];
  onClose: () => void;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  projectId,
  projectStartDate,
  projectEndDate,
  categories,
  tasks,
  onClose,
}) => {
  const [timelineStart, setTimelineStart] = useState<Date>(new Date());
  const [timelineEnd, setTimelineEnd] = useState<Date>(new Date());
  const [timelineDays, setTimelineDays] = useState<Date[]>([]);
  const [tasksByCategory, setTasksByCategory] = useState<{
    [key: string]: TaskData[];
  }>({});

  // Normalize date to DD/MM/YYYY format
  const normalizeDate = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    if (year && month && day) return `${day}/${month}/${year}`;
    const [d, m, y] = dateString.split('/');
    return `${d}/${m}/${y}`;
  };

  // Parse date with error handling
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    try {
      const [day, month, year] = normalizeDate(dateString).split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error(`Error parsing date ${dateString}:`, error);
      return null;
    }
  };

  // Format date to DD/MM/YYYY
  const formatDate = (date: Date | null): string => {
    if (!date || isNaN(date.getTime())) return 'Invalid Date';
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Get month-year string
  const getMonthYear = (date: Date): string => {
    return `Tháng ${date.getMonth() + 1} - ${date.getFullYear()}`;
  };

  // Initialize timeline
  useEffect(() => {
    const start = parseDate(projectStartDate) || new Date();
    const end = parseDate(projectEndDate) || new Date();
    if (start > end) [start, end] = [end, start];

    // Extend timeline để có buffer
    const bufferStart = new Date(start);
    const bufferEnd = new Date(end);
    bufferStart.setDate(bufferStart.getDate() - 7);
    bufferEnd.setDate(bufferEnd.getDate() + 7);

    setTimelineStart(bufferStart);
    setTimelineEnd(bufferEnd);

    const days: Date[] = [];
    let currentDate = new Date(bufferStart);
    while (currentDate <= bufferEnd) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setTimelineDays(days);
  }, [projectStartDate, projectEndDate]);

  // Group tasks by category
  useEffect(() => {
    if (!categories || !tasks) return;
    const tasksByCat: { [key: string]: TaskData[] } = {};
    categories.forEach((category) => {
      tasksByCat[category.id] = tasks.filter((task) => task.category_id === category.id);
    });
    setTasksByCategory(tasksByCat);
  }, [categories, tasks]);

  // Early return if no data
  if (!projectStartDate || !projectEndDate || !categories || !tasks) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 50,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          width: '90%'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2>Loading Timeline...</h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <div>projectStartDate: {projectStartDate || 'missing'}</div>
            <div>projectEndDate: {projectEndDate || 'missing'}</div>
            <div>categories: {categories?.length || 0}</div>
            <div>tasks: {tasks?.length || 0}</div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate task bar styles with improved positioning
  const getTaskBarStyles = (task: TaskData) => {
    const taskStart = parseDate(task.start_date);
    const taskEnd = parseDate(task.due_date);

    if (!taskStart || !taskEnd || !timelineStart || !timelineEnd) {
      console.error(`Invalid dates for task ${task.name}`);
      return { left: '0%', width: '0%', backgroundColor: '#ff0000' };
    }

    const timelineStartTime = timelineStart.getTime();
    const timelineEndTime = timelineEnd.getTime();
    const totalTimelineMs = timelineEndTime - timelineStartTime;

    if (totalTimelineMs <= 0) {
      return { left: '0%', width: '0%', backgroundColor: '#ff0000' };
    }

    const taskStartTime = taskStart.getTime();
    const taskEndTime = taskEnd.getTime();

    // Ensure valid task duration
    if (taskStartTime > taskEndTime) {
      console.warn(`Task ${task.name} has invalid range`);
      return { left: '0%', width: '0%', backgroundColor: '#ff0000' };
    }

    // Calculate position and width
    const startOffset = Math.max(0, taskStartTime - timelineStartTime);
    const endOffset = Math.min(totalTimelineMs, taskEndTime - timelineStartTime);

    const leftPercent = (startOffset / totalTimelineMs) * 100;
    const widthPercent = Math.max(0.5, ((endOffset - startOffset) / totalTimelineMs) * 100);

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      backgroundColor: getCategoryColor(task.category_name),
    };
  };

  // Get category color
  const getCategoryColor = (categoryName: string): string => {
    const colors: { [key: string]: string } = {
      'Definition': '#8e24aa',
      'Design & Planning': '#ff8f00',
      'Development': '#1976d2',
      'Testing': '#d32f2f',
      'Deployment': '#388e3c',
      'Planning': '#8bc34a',
    };
    return colors[categoryName] || '#546e7a';
  };

  // Calculate today marker position
  const getTodayMarkerPosition = () => {
    const today = new Date('2025-06-08T18:36:00+07:00'); // 06:36 PM +07, 08/06/2025
    if (!timelineStart || !timelineEnd) return '0%';
    
    const totalTimelineMs = timelineEnd.getTime() - timelineStart.getTime();
    if (totalTimelineMs <= 0) return '0%';
    
    const todayOffset = today.getTime() - timelineStart.getTime();
    const todayPercent = (todayOffset / totalTimelineMs) * 100;
    
    return `${Math.max(0, Math.min(100, todayPercent))}%`;
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'Todo': '#9e9e9e',
      'In Progress': '#2196f3',
      'Review': '#ff9800',
      'Done': '#4caf50',
      'Cancelled': '#f44336',
    };
    return colors[status] || '#9e9e9e';
  };

  // Calculate minimum width for timeline to ensure proper scrolling
  const timelineWidth = Math.max(800, timelineDays.length * 40);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 200,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        width: '95%',
        height: '90%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>📊 Gantt Chart Timeline</h2>
            <div style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginTop: '8px',
              display: 'flex',
              gap: '20px'
            }}>
              <span>📅 {formatDate(parseDate(projectStartDate))} → {formatDate(parseDate(projectEndDate))}</span>
              <span>📋 {tasks.length} tasks</span>
              <span>🗂️ {categories.length} categories</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s',
              color: '#666'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        {/* Gantt Chart */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Timeline Header */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #e0e0e0',
            backgroundColor: '#f8f9fa'
          }}>
            {/* Category Column Header */}
            <div style={{
              width: '300px',
              minWidth: '300px',
              padding: '15px',
              borderRight: '1px solid #e0e0e0',
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#333',
              backgroundColor: '#fff'
            }}>
              Danh mục / Công việc
            </div>
            
            {/* Timeline Column Header */}
            <div style={{
              flex: 1,
              overflowX: 'auto',
              borderLeft: '1px solid #e0e0e0'
            }}>
              <div style={{ 
                width: `${timelineWidth}px`,
                minWidth: '100%'
              }}>
                {/* Month/Year Label */}
                <div style={{
                  padding: '10px 15px',
                  borderBottom: '1px solid #e0e0e0',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: '#333',
                  textAlign: 'center',
                  backgroundColor: '#f0f0f0'
                }}>
                  {getMonthYear(timelineStart)} - {getMonthYear(timelineEnd)}
                </div>
                
                {/* Date Labels */}
                <div style={{
                  display: 'flex',
                  position: 'relative',
                  backgroundColor: '#fff'
                }}>
                  {timelineDays.map((day, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '40px',
                        minWidth: '40px',
                        padding: '8px 2px',
                        borderRight: '1px solid #f0f0f0',
                        fontSize: '12px',
                        textAlign: 'center',
                        color: day.getDay() === 0 || day.getDay() === 6 ? '#ff5722' : '#333',
                        backgroundColor: day.getDay() === 0 || day.getDay() === 6 ? '#fff3e0' : 'transparent'
                      }}
                      title={formatDate(day)}
                    >
                      <div style={{ fontWeight: 'bold' }}>{day.getDate()}</div>
                      <div style={{ fontSize: '10px', color: '#999' }}>
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day.getDay()]}
                      </div>
                    </div>
                  ))}
                  
                  {/* Today Marker */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      backgroundColor: '#ff4444',
                      left: getTodayMarkerPosition(),
                      zIndex: 10,
                      boxShadow: '0 0 4px rgba(255,68,68,0.5)'
                    }}
                    title="Hôm nay 06:36 PM +07"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Body */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {categories.map((category) => (
              <React.Fragment key={category.id}>
                {/* Category Row */}
                <div style={{
                  display: 'flex',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{
                    width: '300px',
                    minWidth: '300px',
                    padding: '12px 15px',
                    borderRight: '1px solid #e0e0e0',
                    backgroundColor: '#fff'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                      {category.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {category.completed_tasks_count}/{category.tasks_count} hoàn thành
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    overflowX: 'auto'
                  }}>
                    <div style={{
                      width: `${timelineWidth}px`,
                      height: '60px',
                      position: 'relative',
                      display: 'flex'
                    }}>
                      {/* Grid Background */}
                      {timelineDays.map((day, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: '40px',
                            minWidth: '40px',
                            borderRight: '1px solid #f5f5f5',
                            backgroundColor: day.getDay() === 0 || day.getDay() === 6 ? '#fafafa' : 'transparent'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Task Rows */}
                {tasksByCategory[category.id]?.map((task) => (
                  <div key={task.id} style={{
                    display: 'flex',
                    borderBottom: '1px solid #f0f0f0',
                    minHeight: '50px'
                  }}>
                    <div style={{
                      width: '300px',
                      minWidth: '300px',
                      padding: '10px 15px',
                      borderRight: '1px solid #e0e0e0',
                      backgroundColor: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                        {task.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: getStatusColor(task.status),
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: '500'
                          }}
                        >
                          {task.status}
                        </span>
                        <span style={{ fontSize: '11px', color: '#666' }}>
                          {task.start_date} → {task.due_date}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{
                      flex: 1,
                      overflowX: 'auto'
                    }}>
                      <div style={{
                        width: `${timelineWidth}px`,
                        height: '50px',
                        position: 'relative',
                        display: 'flex'
                      }}>
                        {/* Grid Background */}
                        {timelineDays.map((day, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: '40px',
                              minWidth: '40px',
                              borderRight: '1px solid #f5f5f5',
                              backgroundColor: day.getDay() === 0 || day.getDay() === 6 ? '#fafafa' : 'transparent'
                            }}
                          />
                        ))}
                        
                        {/* Task Bar */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '15px',
                            height: '20px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 8px',
                            fontSize: '11px',
                            color: 'white',
                            fontWeight: '500',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s',
                            ...getTaskBarStyles(task)
                          }}
                          title={`${task.name}\n📅 ${task.start_date} → ${task.due_date}\n📊 ${task.status}`}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {task.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{
          padding: '15px 20px',
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: '500', fontSize: '14px', color: '#333' }}>Trạng thái:</span>
          {[
            { status: 'Todo', color: '#9e9e9e' },
            { status: 'In Progress', color: '#2196f3' },
            { status: 'Review', color: '#ff9800' },
            { status: 'Done', color: '#4caf50' },
            { status: 'Cancelled', color: '#f44336' }
          ].map(({ status, color }) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: color,
                borderRadius: '2px'
              }} />
              <span style={{ fontSize: '12px', color: '#666' }}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;

