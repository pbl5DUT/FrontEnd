import axios from 'axios';
import { CalendarEvent } from '../types/calendar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Lấy danh sách tất cả sự kiện lịch làm việc
 */
export const fetchEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const response = await axios.get(`${API_URL}/calendar/events`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Lấy danh sách sự kiện lịch làm việc theo dự án
 */
export const fetchEventsByProject = async (
  projectId: string
): Promise<CalendarEvent[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/calendar/events/project/${projectId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching events by project:', error);
    throw error;
  }
};

/**
 * Lấy danh sách sự kiện lịch làm việc của người dùng hiện tại
 */
export const fetchUserEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const response = await axios.get(`${API_URL}/calendar/events/my-events`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user events:', error);
    throw error;
  }
};

/**
 * Tạo sự kiện mới
 */
function toSnakeCase(obj: any) {
  const newObj: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = obj[key];
  }
  return newObj;
}

export const createEvent = async (
  eventData: Partial<CalendarEvent>
): Promise<CalendarEvent> => {
  try {
    const snakeEventData = toSnakeCase(eventData);
    const response = await axios.post(`${API_URL}/calendar/events`, snakeEventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * Cập nhật sự kiện
 */
export const updateEvent = async (
  eventId: string,
  eventData: Partial<CalendarEvent>
): Promise<CalendarEvent> => {
  try {
    console.log('eventData:', eventData);
    console.log('URL:', `${API_URL}/calendar/events/${eventId}/update`);
    const response = await axios.put(
      `${API_URL}/calendar/events/${eventId}/update`,
      eventData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

/**
 * Xóa sự kiện
 */
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/calendar/events/${eventId}/delete`);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

/**
 * Lấy danh sách các sự kiện sắp đến trong khoảng thời gian
 */
export const fetchUpcomingEvents = async (
  days: number = 7
): Promise<CalendarEvent[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/calendar/events/upcoming?}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

/**
 * Đồng bộ sự kiện với Google Calendar (nếu đã kết nối)
 */
export const syncWithGoogleCalendar = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await axios.post(`${API_URL}/calendar/sync/google`);
    return response.data;
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    throw error;
  }
};
export const fetchProjects = async (): Promise<{ id: string; name: string }[]> => {
  try {
    const response = await axios.get(`${API_URL}/projects`);
    const projects = response.data.map((project: any) => ({
      id: project.project_id,
      name: project.project_name,
    }));
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export default {
  fetchEvents,
  fetchEventsByProject,
  fetchUserEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchUpcomingEvents,
  syncWithGoogleCalendar,
  fetchProjects,
};
