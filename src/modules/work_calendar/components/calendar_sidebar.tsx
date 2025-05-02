'use client';

import React, { useState, useEffect } from 'react';
import { Card, Checkbox, Button, Divider, Select, Switch, message } from 'antd';
import { SyncOutlined, SettingOutlined } from '@ant-design/icons';
import { EventType } from '../types/calendar';
import {
  syncWithGoogleCalendar,
  mockProjects,
} from '../services/canlendar_service_mock';
import styles from '../styles/work_calendar.module.css';

const { Option } = Select;

interface FilterProps {
  onFilterChange?: (filters: CalendarFilters) => void;
}

interface CalendarFilters {
  eventTypes: EventType[];
  showCompleted: boolean;
  projectIds: string[];
  userIds: string[];
}

const CalendarSidebar: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<CalendarFilters>({
    eventTypes: [
      EventType.MEETING,
      EventType.DEADLINE,
      EventType.TASK,
      EventType.OTHER,
    ],
    showCompleted: true,
    projectIds: [],
    userIds: [],
  });

  const [syncing, setSyncing] = useState(false);

  // Khi filters thay đổi, thông báo cho component cha
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  // Xử lý thay đổi loại sự kiện
  const handleEventTypeChange = (eventType: EventType, checked: boolean) => {
    let newEventTypes = [...filters.eventTypes];

    if (checked) {
      newEventTypes.push(eventType);
    } else {
      newEventTypes = newEventTypes.filter((type) => type !== eventType);
    }

    setFilters({
      ...filters,
      eventTypes: newEventTypes,
    });
  };

  // Xử lý thay đổi hiển thị sự kiện đã hoàn thành
  const handleShowCompletedChange = (checked: boolean) => {
    setFilters({
      ...filters,
      showCompleted: checked,
    });
  };

  // Xử lý thay đổi dự án
  const handleProjectChange = (selectedProjects: string[]) => {
    setFilters({
      ...filters,
      projectIds: selectedProjects,
    });
  };

  // Xử lý đồng bộ với Google Calendar
  const handleSyncWithGoogle = async () => {
    try {
      setSyncing(true);
      const result = await syncWithGoogleCalendar();

      if (result.success) {
        message.success(
          result.message || 'Đồng bộ thành công với Google Calendar!'
        );
      } else {
        message.warning(result.message || 'Đồng bộ không hoàn thành');
      }
    } catch (error) {
      console.error('Sync error:', error);
      message.error('Không thể đồng bộ với Google Calendar');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className={styles.sidebarCard} title="Bộ lọc" bordered={false}>
      <div className={styles.filterSection}>
        <h4>Loại sự kiện</h4>

        <div className={styles.checkboxGroup}>
          <Checkbox
            checked={filters.eventTypes.includes(EventType.MEETING)}
            onChange={(e) =>
              handleEventTypeChange(EventType.MEETING, e.target.checked)
            }
          >
            <span
              className={`${styles.eventTypeTag} ${styles.eventTypeMeeting}`}
            >
              Cuộc họp
            </span>
          </Checkbox>

          <Checkbox
            checked={filters.eventTypes.includes(EventType.DEADLINE)}
            onChange={(e) =>
              handleEventTypeChange(EventType.DEADLINE, e.target.checked)
            }
          >
            <span
              className={`${styles.eventTypeTag} ${styles.eventTypeDeadline}`}
            >
              Deadline
            </span>
          </Checkbox>

          <Checkbox
            checked={filters.eventTypes.includes(EventType.TASK)}
            onChange={(e) =>
              handleEventTypeChange(EventType.TASK, e.target.checked)
            }
          >
            <span className={`${styles.eventTypeTag} ${styles.eventTypeTask}`}>
              Công việc
            </span>
          </Checkbox>

          <Checkbox
            checked={filters.eventTypes.includes(EventType.OTHER)}
            onChange={(e) =>
              handleEventTypeChange(EventType.OTHER, e.target.checked)
            }
          >
            <span className={`${styles.eventTypeTag} ${styles.eventTypeOther}`}>
              Khác
            </span>
          </Checkbox>
        </div>
      </div>

      <Divider />

      <div className={styles.filterSection}>
        <h4>Dự án</h4>
        <Select
          mode="multiple"
          placeholder="Chọn dự án"
          style={{ width: '100%' }}
          value={filters.projectIds}
          onChange={handleProjectChange}
        >
          {mockProjects.map((project) => (
            <Option key={project.id} value={project.id}>
              {project.name}
            </Option>
          ))}
        </Select>
      </div>

      <Divider />

      <div className={styles.filterSection}>
        <h4>Tùy chọn khác</h4>
        <div className={styles.optionItem}>
          <span>Hiển thị đã hoàn thành</span>
          <Switch
            checked={filters.showCompleted}
            onChange={handleShowCompletedChange}
          />
        </div>
      </div>

      <Divider />

      <div className={styles.syncSection}>
        <Button
          type="primary"
          icon={<SyncOutlined spin={syncing} />}
          onClick={handleSyncWithGoogle}
          loading={syncing}
          block
        >
          Đồng bộ với Google Calendar
        </Button>
      </div>
    </Card>
  );
};

export default CalendarSidebar;
