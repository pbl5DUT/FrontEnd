'use client';

import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Skeleton, Empty } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { CalendarEvent, EventType } from '../types/calendar';
import {
  fetchUpcomingEvents,
  fetchProjects,
} from '../services/calendar_service';
import moment from 'moment';
import 'moment/locale/vi';
import styles from '../styles/work_calendar.module.css';

moment.locale('vi');

const UpcomingEvents: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7); // Hiển thị sự kiện trong 7 ngày tới

  useEffect(() => {
    loadUpcomingEvents();
  }, [days]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };
    loadProjects();
  }, []);

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

  const formatEventTime = (start: Date, end: Date, isAllDay?: boolean) => {
    if (isAllDay) {
      return `Cả ngày ${moment(start).format('DD/MM/YYYY')}`;
    }

    const startDate = moment(start);
    const endDate = moment(end);

    if (startDate.isSame(endDate, 'day')) {
      return `${startDate.format('HH:mm')} - ${endDate.format(
        'HH:mm, DD/MM/YYYY'
      )}`;
    }

    return `${startDate.format('HH:mm, DD/MM')} - ${endDate.format(
      'HH:mm, DD/MM/YYYY'
    )}`;
  };

  const getDaysFromNow = (date: Date) => {
    const today = moment().startOf('day');
    const eventDate = moment(date).startOf('day');
    const diffDays = eventDate.diff(today, 'days');

    if (diffDays === 0) return <Tag color="magenta">Hôm nay</Tag>;
    if (diffDays === 1) return <Tag color="orange">Ngày mai</Tag>;
    if (diffDays > 1 && diffDays < 7)
      return <Tag color="blue">Còn {diffDays} ngày</Tag>;

    return <Tag color="default">{eventDate.format('DD/MM/YYYY')}</Tag>;
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return '';
    const project = projects.find((p) => p.id === projectId);
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
              <List.Item
                className={styles.upcomingEventItem}
                key={event.event_id || `${event.title}-${event.start}`}
              >
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
