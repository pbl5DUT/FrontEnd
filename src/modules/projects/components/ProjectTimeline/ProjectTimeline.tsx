import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Task, TaskCategory } from '../../types/Task';

// ===== CONSTANTS =====
const DAY_WIDTH = 40;
const CATEGORY_WIDTH = 300;
const MIN_TIMELINE_WIDTH = 800;
const TASK_BAR_HEIGHT = 20;
const BUFFER_DAYS = 7;

const STATUS_COLORS = {
  'Todo': '#9e9e9e',
  'In Progress': '#2196f3',
  'Review': '#ff9800',
  'Done': '#4caf50',
  'Cancelled': '#f44336',
} as const;

const CATEGORY_COLORS = {
  'Definition': '#8e24aa',
  'Design & Planning': '#ff8f00',
  'Development': '#1976d2',
  'Testing': '#d32f2f',
  'Deployment': '#388e3c',
  'Planning': '#8bc34a',
} as const;

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

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




interface ProjectTimelineProps {
  projectId: string;
  projectStartDate: string;
  projectEndDate: string;
  categories: TaskCategory[];
  tasks: Task[];
  onClose?: () => void;
  onTaskClick?: (task: Task) => void;
}

// ===== UTILITY FUNCTIONS =====
class DateUtils {
  static parseDate(dateString: string): Date | null {
    if (!dateString) return null;
    
    try {
      // Handle both DD/MM/YYYY and YYYY-MM-DD formats
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
      } else {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
    } catch (error) {
      console.error(`Error parsing date ${dateString}:`, error);
      return null;
    }
  }

  static formatDate(date: Date | null): string {
    if (!date || isNaN(date.getTime())) return 'Invalid Date';
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }

  static getMonthLabel(date: Date): string {
    return `tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
  }

  static getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  static generateDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    let current = new Date(start);
    
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }

  static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }
}

// ===== SUB-COMPONENTS =====
interface TimelineHeaderProps {
  days: Date[];
  months: Array<{ start: Date; label: string; daysInMonth: number }>;
  timelineWidth: number;
  timelineStart: Date;
  timelineEnd: Date;
  onScroll: (scrollLeft: number) => void;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  days,
  months,
  timelineWidth,
  timelineStart,
  timelineEnd,
  onScroll
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    onScroll(e.currentTarget.scrollLeft);
  }, [onScroll]);

  const todayPosition = useMemo(() => {
    const today = new Date();
    const totalMs = timelineEnd.getTime() - timelineStart.getTime();
    if (totalMs <= 0) return '0%';
    
    const todayOffset = today.getTime() - timelineStart.getTime();
    const todayPercent = (todayOffset / totalMs) * 100;
    
    return `${Math.max(0, Math.min(100, todayPercent))}%`;
  }, [timelineStart, timelineEnd]);

  return (
    <div 
      ref={headerRef}
      onScroll={handleScroll}
      style={{
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        borderLeft: '1px solid #e0e0e0',
      }}
    >
      <div style={{ width: `${timelineWidth}px`, minWidth: '100%' }}>
        {/* Month Labels */}
        <div style={{
          display: 'flex',
          position: 'relative',
          backgroundColor: '#e0eaff',
          padding: '15px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          {months.map((month, idx) => {
            const leftPercent = ((month.start.getTime() - timelineStart.getTime()) / 
                               (timelineEnd.getTime() - timelineStart.getTime())) * 100;
            const widthPercent = (month.daysInMonth * DAY_WIDTH / timelineWidth) * 100;
            
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  textAlign: 'center',
                  color: '#333',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {month.label}
              </div>
            );
          })}
        </div>

        {/* Date Labels */}
        <div style={{
          display: 'flex',
          position: 'relative',
          backgroundColor: '#fff'
        }}>
          {days.map((day, idx) => (
            <div
              key={idx}
              style={{
                width: `${DAY_WIDTH}px`,
                minWidth: `${DAY_WIDTH}px`,
                padding: '8px 2px',
                borderRight: '1px solid #f0f0f0',
                fontSize: '12px',
                textAlign: 'center',
                color: DateUtils.isWeekend(day) ? '#ff5722' : '#333',
                backgroundColor: DateUtils.isWeekend(day) ? '#fff3e0' : 'transparent'
              }}
              title={`${DateUtils.formatDate(day)}`}
            >
              <div style={{ fontWeight: 'bold' }}>{day.getDate()}</div>
              <div style={{ fontSize: '10px', color: '#999' }}>
                {DAYS_OF_WEEK[day.getDay()]}
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
              left: todayPosition,
              zIndex: 10,
              boxShadow: '0 0 4px rgba(255,68,68,0.5)'
            }}
            title="Hôm nay"
          >
            <div style={{
              position: 'absolute',
              top: '-20px',
              left: '-10px',
              backgroundColor: '#ff4444',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              Hôm nay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TaskBarProps {
  task: Task;
  timelineStart: Date;
  timelineEnd: Date;
  timelineWidth: number;
  onClick?: (task: Task) => void;
}

const TaskBar: React.FC<TaskBarProps> = ({ 
  task, 
  timelineStart, 
  timelineEnd, 
  timelineWidth,
  onClick 
}) => {
  const barStyles = useMemo(() => {
    const taskStart = task.start_date ? DateUtils.parseDate(task.start_date) : null;
    const taskEnd = task.due_date ? DateUtils.parseDate(task.due_date) : null;

    if (!taskStart || !taskEnd) {
      return { left: '0%', width: '0%', backgroundColor: '#ff0000' };
    }

    const totalMs = timelineEnd.getTime() - timelineStart.getTime();
    if (totalMs <= 0) return { left: '0%', width: '0%', backgroundColor: '#ff0000' };

    const startOffset = Math.max(0, taskStart.getTime() - timelineStart.getTime());
    const endOffset = Math.min(totalMs, taskEnd.getTime() - timelineStart.getTime());

    const leftPercent = (startOffset / totalMs) * 100;
    const widthPercent = Math.max(1, ((endOffset - startOffset) / totalMs) * 100);

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      backgroundColor: CATEGORY_COLORS[task.category_name as keyof typeof CATEGORY_COLORS] || '#546e7a',
    };
  }, [task, timelineStart, timelineEnd]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '15px',
        height: `${TASK_BAR_HEIGHT}px`,
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        fontSize: '11px',
        color: 'white',
        fontWeight: '500',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
        ...barStyles
      }}
      title={`${task.task_name}\n📅 ${task.start_date} → ${task.due_date}\n📊 ${task.status}`}
      onClick={() => onClick?.(task)}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <span style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {task.task_name}
      </span>
    </div>
  );
};

// ===== MAIN COMPONENT =====
const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  projectId,
  projectStartDate,
  projectEndDate,
  categories,
  tasks,
  onClose,
  onTaskClick,
}) => {
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const timelineBodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<boolean>(false);

  // Parse and validate dates
  const { timelineStart, timelineEnd, isValidData } = useMemo(() => {
    const start = DateUtils.parseDate(projectStartDate);
    const end = DateUtils.parseDate(projectEndDate);
    
    if (!start || !end || !categories || !tasks) {
      return { timelineStart: null, timelineEnd: null, isValidData: false };
    }

    // Add buffer days
    const bufferStart = new Date(start);
    const bufferEnd = new Date(end);
    bufferStart.setDate(bufferStart.getDate() - BUFFER_DAYS);
    bufferEnd.setDate(bufferEnd.getDate() + BUFFER_DAYS);

    return {
      timelineStart: bufferStart,
      timelineEnd: bufferEnd,
      isValidData: true
    };
  }, [projectStartDate, projectEndDate, categories, tasks]);

  // Generate timeline days and months
  const { timelineDays, monthData, timelineWidth } = useMemo(() => {
    if (!timelineStart || !timelineEnd) {
      return { timelineDays: [], monthData: [], timelineWidth: MIN_TIMELINE_WIDTH };
    }

    const days = DateUtils.generateDateRange(timelineStart, timelineEnd);
    const calculatedWidth = Math.max(MIN_TIMELINE_WIDTH, days.length * DAY_WIDTH);

    // Generate month data
    const months: Array<{ start: Date; label: string; daysInMonth: number }> = [];
    let current = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), 1);
    
    while (current <= timelineEnd) {
      const monthStart = new Date(current);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const daysInMonth = Math.min(
        DateUtils.getDaysInMonth(monthStart),
        Math.ceil((timelineEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );
      
      months.push({
        start: monthStart,
        label: DateUtils.getMonthLabel(monthStart),
        daysInMonth
      });
      
      current.setMonth(current.getMonth() + 1);
    }

    return {
      timelineDays: days,
      monthData: months,
      timelineWidth: calculatedWidth
    };
  }, [timelineStart, timelineEnd]);

  // Group tasks by category
  const tasksByCategory = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};
    categories.forEach((category) => {
      grouped[category.id] = tasks.filter((task) => task?.category_info?.id === category.id);
    });
    return grouped;
  }, [categories, tasks]);

  // Scroll synchronization
  const syncScroll = useCallback((newScrollLeft: number, newScrollTop: number, source: 'header' | 'body' | 'category') => {
    if (isScrollingRef.current) return;
    
    isScrollingRef.current = true;
    setScrollLeft(newScrollLeft);
    setScrollTop(newScrollTop);
    
    if (source !== 'body' && timelineBodyRef.current) {
      timelineBodyRef.current.scrollLeft = newScrollLeft;
      timelineBodyRef.current.scrollTop = newScrollTop;
    }
    if (source !== 'header' && headerRef.current) {
      headerRef.current.scrollLeft = newScrollLeft;
    }
    if (source !== 'category' && categoryRef.current) {
      categoryRef.current.scrollTop = newScrollTop;
    }
    
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 10);
  }, []);

  const handleBodyScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!isScrollingRef.current) {
      syncScroll(e.currentTarget.scrollLeft, e.currentTarget.scrollTop, 'body');
    }
  }, [syncScroll]);

  const handleCategoryScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!isScrollingRef.current) {
      syncScroll(scrollLeft, e.currentTarget.scrollTop, 'category');
    }
  }, [syncScroll, scrollLeft]);

  // Early return for invalid data
  if (!isValidData || !timelineStart || !timelineEnd) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#333' }}>Dữ liệu không hợp lệ</h2>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Vui lòng kiểm tra lại thông tin dự án và tasks.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa'
      }}>
        <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>
          📊 Gantt Chart Timeline
        </h2>
        <div style={{ 
          fontSize: '14px', 
          color: '#666', 
          marginTop: '8px',
          display: 'flex',
          gap: '20px'
        }}>
          <span>📅 {DateUtils.formatDate(DateUtils.parseDate(projectStartDate))} → {DateUtils.formatDate(DateUtils.parseDate(projectEndDate))}</span>
          <span>📋 {tasks.length} tasks</span>
          <span>🗂️ {categories.length} categories</span>
        </div>
      </div>

      {/* Gantt Chart */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #e0e0e0' }}>
          <div style={{
            width: `${CATEGORY_WIDTH}px`,
            minWidth: `${CATEGORY_WIDTH}px`,
            padding: '15px',
            borderRight: '1px solid #e0e0e0',
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#333',
            backgroundColor: '#fff',
            position: 'sticky',
            left: 0,
            zIndex: 20,
            height: '60px',
            display: 'flex',
            alignItems: 'center'
          }}>
            Danh mục / Công việc
          </div>
          <TimelineHeader
            days={timelineDays}
            months={monthData}
            timelineWidth={timelineWidth}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            onScroll={(scrollLeft) => syncScroll(scrollLeft, scrollTop, 'header')}
          />
        </div>

        {/* Timeline Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div 
            ref={categoryRef}
            onScroll={handleCategoryScroll}
            style={{
              width: `${CATEGORY_WIDTH}px`,
              minWidth: `${CATEGORY_WIDTH}px`,
              backgroundColor: '#fff',
              borderRight: '1px solid #e0e0e0',
              overflowY: 'auto',
              position: 'sticky',
              left: 0,
              zIndex: 10
            }}
          >
            {categories.map((category) => (
              <React.Fragment key={category.id}>
                <div style={{
                  padding: '12px 15px',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: '#f8f9fa',
                  height: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                    {category.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {category.completed_tasks_count}/{category.tasks_count} hoàn thành
                  </div>
                </div>
                {tasksByCategory[category.id]?.map((task) => (
                  <div key={task.task_id} style={{
                    padding: '10px 15px',
                    borderBottom: '1px solid #f0f0f0',
                    height: '50px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                      {task.task_name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: STATUS_COLORS[task.status],
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
                ))}
              </React.Fragment>
            ))}
          </div>
          
          <div 
            ref={timelineBodyRef}
            onScroll={handleBodyScroll}
            style={{ 
              flex: 1, 
              overflowX: 'auto',
              overflowY: 'auto'
            }}
          >
            <div style={{ width: `${timelineWidth}px`, minWidth: '100%' }}>
              {categories.map((category) => (
                <React.Fragment key={category.id}>
                  <div style={{
                    height: '60px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex'
                  }}>
                    {timelineDays.map((day, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: `${DAY_WIDTH}px`,
                          minWidth: `${DAY_WIDTH}px`,
                          borderRight: '1px solid #f5f5f5',
                          backgroundColor: DateUtils.isWeekend(day) ? '#fafafa' : 'transparent'
                        }}
                      />
                    ))}
                  </div>
                  {tasksByCategory[category.id]?.map((task) => (
                    <div key={task.task_id} style={{
                      height: '50px',
                      borderBottom: '1px solid #f0f0f0',
                      position: 'relative',
                      display: 'flex'
                    }}>
                      {timelineDays.map((day, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: `${DAY_WIDTH}px`,
                            minWidth: `${DAY_WIDTH}px`,
                            borderRight: '1px solid #f5f5f5',
                            backgroundColor: DateUtils.isWeekend(day) ? '#fafafa' : 'transparent'
                          }}
                        />
                      ))}
                      <TaskBar
                        task={task}
                        timelineStart={timelineStart}
                        timelineEnd={timelineEnd}
                        timelineWidth={timelineWidth}
                        onClick={onTaskClick}
                      />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
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
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
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
  );
};

export default ProjectTimeline;