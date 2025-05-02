'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAuth } from '@/modules/auth/contexts/auth_context';
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  mockProjects,
} from '../services/canlendar_service_mock'; // Sử dụng dữ liệu giả
import { EventType, CalendarEvent } from '../types/calendar';
import styles from '../styles/work_calendar.module.css';

// Cấu hình ngôn ngữ tiếng Việt
moment.locale('vi');
const localizer = momentLocalizer(moment);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const WorkCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Fetch sự kiện khi component mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
      message.error('Không thể tải lịch làm việc. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
    setIsEditMode(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedEvent(null);
    form.resetFields();
  };

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditMode(true);
    setIsModalVisible(true);

    form.setFieldsValue({
      title: event.title,
      description: event.description,
      type: event.type,
      dateRange: [moment(event.start), moment(event.end)],
      projectId: event.projectId,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const eventData: Partial<CalendarEvent> = {
        title: values.title,
        description: values.description,
        type: values.type,
        start: values.dateRange[0].toDate(),
        end: values.dateRange[1].toDate(),
        projectId: values.projectId,
        // userId: user?.id || 'user-1', // Sử dụng ID người dùng từ auth context nếu có
      };

      setLoading(true);

      if (isEditMode && selectedEvent) {
        await updateEvent(selectedEvent.id, eventData);
        message.success('Cập nhật sự kiện thành công');
      } else {
        await createEvent(eventData);
        message.success('Tạo sự kiện thành công');
      }

      setIsModalVisible(false);
      loadEvents();
    } catch (error) {
      console.error('Error submitting event:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      setLoading(true);
      await deleteEvent(selectedEvent.id);
      message.success('Đã xóa sự kiện');
      setIsModalVisible(false);
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      message.error('Không thể xóa sự kiện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let style = {
      backgroundColor: '#3174ad',
      borderRadius: '5px',
      color: 'white',
      border: '0px',
      display: 'block',
    };

    switch (event.type) {
      case EventType.MEETING:
        style.backgroundColor = '#1890ff';
        break;
      case EventType.DEADLINE:
        style.backgroundColor = '#ff4d4f';
        break;
      case EventType.TASK:
        style.backgroundColor = '#52c41a';
        break;
      case EventType.OTHER:
        style.backgroundColor = '#722ed1';
        break;
      default:
        break;
    }

    return { style };
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          Thêm sự kiện
        </Button>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 200px)' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleEventSelect}
        views={['month', 'week', 'day', 'agenda']}
        messages={{
          month: 'Tháng',
          week: 'Tuần',
          day: 'Ngày',
          agenda: 'Lịch trình',
          previous: 'Trước',
          next: 'Sau',
          today: 'Hôm nay',
          showMore: (total) => `+ ${total} sự kiện khác`,
        }}
      />

      <Modal
        title={isEditMode ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          isEditMode && (
            <Button
              key="delete"
              danger
              onClick={handleDelete}
              loading={loading}
            >
              Xóa
            </Button>
          ),
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            loading={loading}
          >
            {isEditMode ? 'Cập nhật' : 'Tạo'}
          </Button>,
        ].filter(Boolean)}
      >
        <Form form={form} layout="vertical" name="event_form">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề sự kiện' },
            ]}
          >
            <Input placeholder="Nhập tiêu đề sự kiện" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Nhập mô tả chi tiết (tùy chọn)" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại sự kiện"
            rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện' }]}
          >
            <Select placeholder="Chọn loại sự kiện">
              <Option value={EventType.MEETING}>Cuộc họp</Option>
              <Option value={EventType.DEADLINE}>Deadline</Option>
              <Option value={EventType.TASK}>Công việc</Option>
              <Option value={EventType.OTHER}>Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời gian"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
          >
            <RangePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder={['Bắt đầu', 'Kết thúc']}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="projectId" label="Dự án liên quan">
            <Select placeholder="Chọn dự án (tùy chọn)" allowClear>
              {mockProjects.map((project) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkCalendar;
