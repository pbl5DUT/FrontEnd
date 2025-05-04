import React, { useState, useEffect } from 'react';
import styles from './ProjectTimeline.module.css';

interface TaskData {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  start_date: string;
  due_date: string;
  status: string;
  assignees: any[];
}

interface CategoryData {
  id: string;
  name: string;
  project_id: string;
  tasks_count: number;
  completed_tasks_count: number;
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
  const [monthLabels, setMonthLabels] = useState<
    { month: string; position: number }[]
  >([]);
  const [tasksByCategory, setTasksByCategory] = useState<{
    [key: string]: TaskData[];
  }>({});

  // Parse date from DD/MM/YYYY format
  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Format date to DD/MM/YYYY
  const formatDate = (date: Date): string => {
    return `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Initialize timeline
  useEffect(() => {
    if (projectStartDate && projectEndDate) {
      const start = parseDate(projectStartDate);
      const end = parseDate(projectEndDate);

      // Add buffer days to timeline for better visualization
      start.setDate(start.getDate() - 7);
      end.setDate(end.getDate() + 7);

      setTimelineStart(start);
      setTimelineEnd(end);

      // Generate array of dates for the timeline
      const days: Date[] = [];
      const months: { month: string; position: number }[] = [];
      let currentDate = new Date(start);
      let currentMonth = '';
      let dayCounter = 0;

      while (currentDate <= end) {
        days.push(new Date(currentDate));

        // Track months for labels
        const monthName =
          currentDate.toLocaleString('default', { month: 'short' }) +
          ' ' +
          currentDate.getFullYear();
        if (monthName !== currentMonth) {
          months.push({ month: monthName, position: dayCounter });
          currentMonth = monthName;
        }

        currentDate.setDate(currentDate.getDate() + 1);
        dayCounter++;
      }

      setTimelineDays(days);
      setMonthLabels(months);
    }
  }, [projectStartDate, projectEndDate]);

  // Group tasks by category
  useEffect(() => {
    const tasksByCat: { [key: string]: TaskData[] } = {};

    categories.forEach((category) => {
      tasksByCat[category.id] = tasks.filter(
        (task) => task.category_id === category.id
      );
    });

    setTasksByCategory(tasksByCat);
  }, [categories, tasks]);

  // Calculate position and width of a task bar
  const getTaskBarStyles = (task: TaskData) => {
    const taskStart = parseDate(task.start_date);
    const taskEnd = parseDate(task.due_date);

    // Calculate days from timeline start
    const daysFromStart = Math.max(
      0,
      (taskStart.getTime() - timelineStart.getTime()) / (1000 * 3600 * 24)
    );
    const taskDuration = Math.max(
      1,
      (taskEnd.getTime() - taskStart.getTime()) / (1000 * 3600 * 24) + 1
    );

    const left = `${(daysFromStart / timelineDays.length) * 100}%`;
    const width = `${(taskDuration / timelineDays.length) * 100}%`;

    // Determine color based on status
    let backgroundColor = '';
    switch (task.status.toLowerCase()) {
      case 'done':
        backgroundColor = '#4caf50'; // green
        break;
      case 'in progress':
        backgroundColor = '#2196f3'; // blue
        break;
      case 'review':
        backgroundColor = '#ff9800'; // orange
        break;
      default:
        backgroundColor = '#9e9e9e'; // grey for todo or other statuses
    }

    return { left, width, backgroundColor };
  };

  // Calculate today's marker position
  const getTodayMarkerPosition = () => {
    const today = new Date();
    const daysFromStart = Math.max(
      0,
      (today.getTime() - timelineStart.getTime()) / (1000 * 3600 * 24)
    );
    return `${(daysFromStart / timelineDays.length) * 100}%`;
  };

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineHeader}>
        <h2>Lịch trình dự án</h2>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>

      <div className={styles.timelineToolbar}>
        <div className={styles.projectDateRange}>
          <span className={styles.dateLabel}>Thời gian dự án:</span>
          <span className={styles.dateValue}>
            {projectStartDate} - {projectEndDate}
          </span>
        </div>
      </div>

      <div className={styles.ganttChartContainer}>
        {/* Timeline header with month labels */}
        <div className={styles.timelineHeader}>
          <div className={styles.categoryColumn}>
            <div className={styles.categoryHeader}>Danh mục / Công việc</div>
          </div>
          <div className={styles.timelineColumn}>
            <div className={styles.monthLabels}>
              {monthLabels.map((month, idx) => (
                <div
                  key={idx}
                  className={styles.monthLabel}
                  style={{
                    left: `${(month.position / timelineDays.length) * 100}%`,
                  }}
                >
                  {month.month}
                </div>
              ))}
            </div>

            <div className={styles.dayGrid}>
              {timelineDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`${styles.dayColumn} ${
                    day.getDay() === 0 || day.getDay() === 6
                      ? styles.weekend
                      : ''
                  }`}
                  title={formatDate(day)}
                />
              ))}
            </div>

            {/* Today marker */}
            <div
              className={styles.todayMarker}
              style={{ left: getTodayMarkerPosition() }}
              title="Hôm nay"
            />
          </div>
        </div>

        {/* Timeline rows for categories and tasks */}
        <div className={styles.timelineBody}>
          {categories.map((category) => (
            <React.Fragment key={category.id}>
              {/* Category row */}
              <div className={styles.timelineRow}>
                <div className={styles.categoryColumn}>
                  <div className={styles.categoryName}>{category.name}</div>
                </div>
                <div className={styles.timelineColumn}>
                  <div className={styles.categoryBar}></div>
                </div>
              </div>

              {/* Task rows for this category */}
              {tasksByCategory[category.id]?.map((task) => (
                <div key={task.id} className={styles.timelineRow}>
                  <div className={styles.categoryColumn}>
                    <div className={styles.taskName}>{task.name}</div>
                  </div>
                  <div className={styles.timelineColumn}>
                    <div
                      className={styles.taskBar}
                      style={getTaskBarStyles(task)}
                      title={`${task.name}: ${task.start_date} - ${task.due_date}`}
                    >
                      <span className={styles.taskBarLabel}>{task.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className={styles.timelineLegend}>
        <div className={styles.legendItem}>
          <div
            className={styles.legendColor}
            style={{ backgroundColor: '#9e9e9e' }}
          ></div>
          <span>Chưa làm</span>
        </div>
        <div className={styles.legendItem}>
          <div
            className={styles.legendColor}
            style={{ backgroundColor: '#2196f3' }}
          ></div>
          <span>Đang thực hiện</span>
        </div>
        <div className={styles.legendItem}>
          <div
            className={styles.legendColor}
            style={{ backgroundColor: '#ff9800' }}
          ></div>
          <span>Đang kiểm duyệt</span>
        </div>
        <div className={styles.legendItem}>
          <div
            className={styles.legendColor}
            style={{ backgroundColor: '#4caf50' }}
          ></div>
          <span>Hoàn thành</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;
