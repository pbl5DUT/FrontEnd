'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
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
  fetchProjects,
} from '../services/calendar_service'; // ✅ Dùng dữ liệu thật
import { EventType, CalendarEvent } from '../types/calendar';
import styles from '../styles/work_calendar.module.css';
import { v4 as uuidv4 } from 'uuid';

moment.locale('vi');
const localizer = momentLocalizer(moment);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const WorkCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<View>('month'); // fix kiểu View

  useEffect(() => {
    loadEvents();
    loadProjects();
  }, []);

  const loadEvents = async () => {
  try {
    setLoading(true);
    const data = await fetchEvents();
    const eventsWithDates = data.map(ev => ({
      ...ev,
      start: new Date(ev.start),
      end: new Date(ev.end),
    }));
    setEvents(eventsWithDates);
  } catch (error) {
    console.error('Error loading events:', error);
    message.error('Không thể tải lịch làm việc. Vui lòng thử lại sau.');
  } finally {
    setLoading(false);
  }
};


  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };
  const showModal = () => {
    setIsModalVisible(true);
    setIsEditMode(false);
    setSelectedEvent(null);
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

    const newId = uuidv4(); // <-- tạo ID mới nếu là tạo mới

    const eventData: Partial<CalendarEvent> = {
      event_id: isEditMode && selectedEvent ? selectedEvent.event_id : newId, // luôn có event_id
      title: values.title,
      description: values.description,
      type: values.type,
      start: values.dateRange[0].toISOString(),
      end: values.dateRange[1].toISOString(),
      projectId: values.projectId,
      userId: user?.user_id?.toString(),
    };

    console.log('Dữ liệu gửi lên API:', eventData);

    setLoading(true);

    if (isEditMode && selectedEvent) {
      await updateEvent(selectedEvent.event_id, eventData);
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
      await deleteEvent(selectedEvent.event_id);
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
    backgroundColor: '#3174ad', // màu mặc định
    borderRadius: '5px',
    color: 'white',
    border: '0px',
    display: 'block',
  };

  const normalizedType = event.type?.toUpperCase(); // chuẩn hóa thành chữ hoa

  switch (normalizedType) {
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
        view={currentView}               // fix ở đây: set kiểu View
        onView={(view: View) => setCurrentView(view)}
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
            <Button key="delete" danger onClick={handleDelete} loading={loading}>
              Xóa
            </Button>
          ),
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
            {isEditMode ? 'Cập nhật' : 'Tạo'}
          </Button>,
        ].filter(Boolean)}
      >
        <Form form={form} layout="vertical" name="event_form">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề sự kiện' }]}
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
              {projects.map((project) => (
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
