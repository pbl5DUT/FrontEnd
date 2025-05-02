import { CalendarEvent, EventType } from '../types/calendar';
import { v4 as uuidv4 } from 'uuid';

// Dữ liệu giả cho các sự kiện lịch
const mockEvents: CalendarEvent[] = [
  {
    id: uuidv4(),
    title: 'Họp Sprint Planning',
    description: 'Lên kế hoạch cho sprint mới, chia task cho các thành viên',
    start: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      9,
      0
    ), // Hôm nay lúc 9:00
    end: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      10,
      30
    ), // Hôm nay lúc 10:30
    type: EventType.MEETING,
    projectId: 'project-1',
    userId: 'user-1',
    location: 'Phòng họp A',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: 'Deadline nộp báo cáo',
    description: 'Hoàn thành báo cáo tiến độ dự án tháng này',
    start: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 2,
      17,
      0
    ), // 2 ngày sau lúc 17:00
    end: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 2,
      17,
      30
    ), // 2 ngày sau lúc 17:30
    type: EventType.DEADLINE,
    projectId: 'project-2',
    userId: 'user-1',
    isAllDay: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: 'Họp Review Sprint',
    description: 'Review kết quả sprint vừa qua và demo sản phẩm',
    start: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 5,
      14,
      0
    ), // 5 ngày sau lúc 14:00
    end: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 5,
      16,
      0
    ), // 5 ngày sau lúc 16:00
    type: EventType.MEETING,
    projectId: 'project-1',
    userId: 'user-2',
    location: 'Phòng họp B',
    participantIds: ['user-1', 'user-2', 'user-3'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: 'Phát triển tính năng đăng nhập',
    description: 'Phát triển chức năng đăng nhập và xác thực người dùng',
    start: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 1,
      9,
      0
    ), // 1 ngày sau lúc 9:00
    end: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 3,
      17,
      0
    ), // 3 ngày sau lúc 17:00
    type: EventType.TASK,
    projectId: 'project-3',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: 'Workshop UX/UI',
    description: 'Workshop về thiết kế giao diện người dùng',
    start: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 7,
      13,
      0
    ), // 7 ngày sau lúc 13:00
    end: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 7,
      16,
      0
    ), // 7 ngày sau lúc 16:00
    type: EventType.OTHER,
    projectId: 'project-2',
    userId: 'user-3',
    location: 'Phòng hội thảo',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: 'Demo sản phẩm cho khách hàng',
    description: 'Trình diễn sản phẩm và nhận phản hồi từ khách hàng',
    start: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 10,
      10,
      0
    ), // 10 ngày sau lúc 10:00
    end: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 10,
      11,
      30
    ), // 10 ngày sau lúc 11:30
    type: EventType.MEETING,
    projectId: 'project-1',
    userId: 'user-2',
    location: 'Văn phòng khách hàng',
    participantIds: ['user-1', 'user-2'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: 'Release sản phẩm v1.0',
    description: 'Phát hành phiên bản đầu tiên của sản phẩm',
    start: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 14,
      0,
      0
    ), // 14 ngày sau lúc 00:00
    end: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 14,
      23,
      59
    ), // 14 ngày sau lúc 23:59
    type: EventType.DEADLINE,
    projectId: 'project-3',
    userId: 'user-1',
    isAllDay: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: 'Kiểm thử hệ thống',
    description: 'Kiểm thử toàn bộ hệ thống trước khi release',
    start: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 12,
      9,
      0
    ), // 12 ngày sau lúc 9:00
    end: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 13,
      17,
      0
    ), // 13 ngày sau lúc 17:00
    type: EventType.TASK,
    projectId: 'project-3',
    userId: 'user-3',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: 'Đào tạo người dùng',
    description: 'Đào tạo nhân viên khách hàng sử dụng sản phẩm',
    start: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 15,
      9,
      0
    ), // 15 ngày sau lúc 9:00
    end: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 16,
      17,
      0
    ), // 16 ngày sau lúc 17:00
    type: EventType.OTHER,
    projectId: 'project-1',
    userId: 'user-2',
    location: 'Văn phòng khách hàng',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: 'Họp Retrospective',
    description: 'Nhìn lại quá trình làm việc và rút kinh nghiệm',
    start: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 6,
      15,
      0
    ), // 6 ngày sau lúc 15:00
    end: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 6,
      16,
      30
    ), // 6 ngày sau lúc 16:30
    type: EventType.MEETING,
    projectId: 'project-1',
    userId: 'user-1',
    location: 'Phòng họp A',
    participantIds: ['user-1', 'user-2', 'user-3'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Dữ liệu giả các dự án
export const mockProjects = [
  { id: 'project-1', name: 'Website Bán hàng' },
  { id: 'project-2', name: 'App Mobile Giao hàng' },
  { id: 'project-3', name: 'Hệ thống Quản lý Nhân sự' },
];

// Dữ liệu giả các người dùng
export const mockUsers = [
  { id: 'user-1', name: 'Nguyễn Văn A' },
  { id: 'user-2', name: 'Trần Thị B' },
  { id: 'user-3', name: 'Lê Minh C' },
];

/**
 * Lấy danh sách tất cả sự kiện lịch làm việc
 */
export const fetchEvents = async (): Promise<CalendarEvent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockEvents]);
    }, 500);
  });
};

/**
 * Lấy danh sách sự kiện lịch làm việc theo dự án
 */
export const fetchEventsByProject = async (
  projectId: string
): Promise<CalendarEvent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredEvents = mockEvents.filter(
        (event) => event.projectId === projectId
      );
      resolve([...filteredEvents]);
    }, 500);
  });
};

/**
 * Lấy danh sách sự kiện lịch làm việc của người dùng hiện tại
 */
export const fetchUserEvents = async (): Promise<CalendarEvent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Giả định người dùng hiện tại là user-1
      const filteredEvents = mockEvents.filter(
        (event) =>
          event.userId === 'user-1' ||
          (event.participantIds && event.participantIds.includes('user-1'))
      );
      resolve([...filteredEvents]);
    }, 500);
  });
};

/**
 * Tạo sự kiện mới
 */
export const createEvent = async (
  eventData: Partial<CalendarEvent>
): Promise<CalendarEvent> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newEvent: CalendarEvent = {
        id: uuidv4(),
        title: eventData.title || '',
        description: eventData.description || '',
        start: eventData.start || new Date(),
        end: eventData.end || new Date(),
        type: eventData.type || EventType.OTHER,
        projectId: eventData.projectId,
        userId: eventData.userId || 'user-1',
        location: eventData.location,
        isAllDay: eventData.isAllDay || false,
        participantIds: eventData.participantIds || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockEvents.push(newEvent);
      resolve(newEvent);
    }, 500);
  });
};

/**
 * Cập nhật sự kiện
 */
export const updateEvent = async (
  eventId: string,
  eventData: Partial<CalendarEvent>
): Promise<CalendarEvent> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockEvents.findIndex((event) => event.id === eventId);

      if (index === -1) {
        reject(new Error('Event not found'));
        return;
      }

      const updatedEvent = {
        ...mockEvents[index],
        ...eventData,
        updatedAt: new Date(),
      };

      mockEvents[index] = updatedEvent;
      resolve(updatedEvent);
    }, 500);
  });
};

/**
 * Xóa sự kiện
 */
export const deleteEvent = async (eventId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockEvents.findIndex((event) => event.id === eventId);

      if (index === -1) {
        reject(new Error('Event not found'));
        return;
      }

      mockEvents.splice(index, 1);
      resolve();
    }, 500);
  });
};

/**
 * Lấy danh sách các sự kiện sắp đến trong khoảng thời gian
 */
export const fetchUpcomingEvents = async (
  days: number = 7
): Promise<CalendarEvent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + days);

      const upcomingEvents = mockEvents
        .filter((event) => {
          return event.start >= today && event.start <= endDate;
        })
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      resolve([...upcomingEvents]);
    }, 500);
  });
};

/**
 * Đồng bộ sự kiện với Google Calendar (giả lập)
 */
export const syncWithGoogleCalendar = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Đồng bộ thành công với Google Calendar!',
      });
    }, 1000);
  });
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
  mockProjects,
  mockUsers,
};
