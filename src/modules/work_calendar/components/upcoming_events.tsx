'use client';

import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Skeleton, Empty } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { CalendarEvent, EventType } from '../types/calendar';
import {
  fetchUpcomingEvents,
  mockProjects,
} from '../services/canlendar_service_mock'; // Sử dụng dữ liệu giả
import moment from 'moment';
import 'moment/locale/vi';
import styles from '../styles/work_calendar.module.css';

// Định dạng ngôn ngữ tiếng Việt
moment.locale('vi');

const UpcomingEvents: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7); // Hiển thị sự kiện trong 7 ngày tới

  useEffect(() => {
    loadUpcomingEvents();
  }, [days]);

  const loadUpcomingEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchUpcomingEvents(days);
      setEvents(data);
    } catch (error) {
      console.error('Error loading upcoming events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chuyển đổi loại sự kiện sang tag màu
  const getEventTypeTag = (type: EventType) => {
    switch (type) {
      case EventType.MEETING:
        return <Tag color="blue">Cuộc họp</Tag>;
      case EventType.DEADLINE:
        return <Tag color="red">Deadline</Tag>;
      case EventType.TASK:
        return <Tag color="green">Công việc</Tag>;
      case EventType.OTHER:
        return <Tag color="purple">Khác</Tag>;
      default:
        return <Tag>Khác</Tag>;
    }
  };

  // Format thời gian
  const formatEventTime = (start: Date, end: Date, isAllDay?: boolean) => {
    if (isAllDay) {
      return `Cả ngày ${moment(start).format('DD/MM/YYYY')}`;
    }

    const startDate = moment(start);
    const endDate = moment(end);

    // Nếu cùng ngày
    if (startDate.isSame(endDate, 'day')) {
      return `${startDate.format('HH:mm')} - ${endDate.format(
        'HH:mm, DD/MM/YYYY'
      )}`;
    }

    // Nếu khác ngày
    return `${startDate.format('HH:mm, DD/MM')} - ${endDate.format(
      'HH:mm, DD/MM/YYYY'
    )}`;
  };

  // Định dạng cho hiển thị "Còn X ngày" hoặc "Hôm nay"
  const getDaysFromNow = (date: Date) => {
    const today = moment().startOf('day');
    const eventDate = moment(date).startOf('day');
    const diffDays = eventDate.diff(today, 'days');

    if (diffDays === 0) {
      return <Tag color="magenta">Hôm nay</Tag>;
    } else if (diffDays === 1) {
      return <Tag color="orange">Ngày mai</Tag>;
    } else if (diffDays > 1 && diffDays < 7) {
      return <Tag color="blue">Còn {diffDays} ngày</Tag>;
    } else {
      return <Tag color="default">{eventDate.format('DD/MM/YYYY')}</Tag>;
    }
  };

  // Lấy tên dự án từ ID
  const getProjectName = (projectId?: string) => {
    if (!projectId) return '';
    const project = mockProjects.find((p) => p.id === projectId);
    return project ? project.name : '';
  };

  return (
    <Card
      title="Sự kiện sắp tới"
      className={styles.upcomingEventsCard}
      extra={
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setDays(days === 7 ? 30 : 7);
          }}
        >
          {days === 7 ? 'Xem 30 ngày' : 'Xem 7 ngày'}
        </a>
      }
    >
      <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
        {events.length === 0 ? (
          <Empty
            description="Không có sự kiện sắp tới"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={events}
            renderItem={(event) => (
              <List.Item className={styles.upcomingEventItem}>
                <div className={styles.eventMeta}>
                  <div className={styles.eventTime}>
                    <ClockCircleOutlined />
                    <span>
                      {formatEventTime(event.start, event.end, event.isAllDay)}
                    </span>
                  </div>

                  <div className={styles.eventTypeWrapper}>
                    {getEventTypeTag(event.type)}
                    {getDaysFromNow(event.start)}
                  </div>
                </div>

                <div className={styles.eventTitle}>{event.title}</div>

                {event.location && (
                  <div className={styles.eventLocation}>
                    <EnvironmentOutlined />
                    <span>{event.location}</span>
                  </div>
                )}

                {event.projectId && (
                  <div className={styles.projectInfo}>
                    <Tag color="cyan">
                      Dự án: {getProjectName(event.projectId)}
                    </Tag>
                  </div>
                )}
              </List.Item>
            )}
          />
        )}
      </Skeleton>
    </Card>
  );
};

export default UpcomingEvents;
