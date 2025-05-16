/**
 * Loại sự kiện trong lịch làm việc
 */
export enum EventType {
  MEETING = 'MEETING', // Cuộc họp
  DEADLINE = 'DEADLINE', // Thời hạn
  TASK = 'TASK', // Công việc
  OTHER = 'OTHER', // Khác
}

/**
 * Interface cho sự kiện lịch làm việc
 */
export interface CalendarEvent {
  event_id: string; // ID sự kiện
  title: string; // Tiêu đề sự kiện
  description?: string; // Mô tả chi tiết (không bắt buộc)
  start: Date; // Thời gian bắt đầu
  end: Date; // Thời gian kết thúc
  type: EventType; // Loại sự kiện
  projectId?: string; // ID dự án liên quan (không bắt buộc)
  userId: string; // ID người tạo sự kiện
  teamIds?: string[]; // ID các nhóm liên quan (không bắt buộc)
  participantIds?: string[]; // ID người tham gia (không bắt buộc)
  location?: string; // Địa điểm (không bắt buộc)
  isAllDay?: boolean; // Sự kiện cả ngày hay không
  reminder?: number; // Nhắc nhở trước bao nhiêu phút
  recurrence?: RecurrenceRule; // Quy tắc lặp lại (không bắt buộc)
  color?: string; // Màu sắc hiển thị (không bắt buộc)
  createdAt: Date; // Thời gian tạo
  updatedAt: Date; // Thời gian cập nhật gần nhất
}

/**
 * Quy tắc lặp lại sự kiện
 */
export interface RecurrenceRule {
  frequency: RecurrenceFrequency; // Tần suất lặp lại
  interval?: number; // Khoảng thời gian (mặc định là 1)
  endDate?: Date; // Ngày kết thúc lặp lại
  count?: number; // Số lần lặp lại
  weekDays?: WeekDay[]; // Các ngày trong tuần (cho sự kiện hàng tuần)
  monthDays?: number[]; // Các ngày trong tháng (cho sự kiện hàng tháng)
  positions?: number[]; // Vị trí (ví dụ: Thứ 2 đầu tiên của tháng)
}

/**
 * Tần suất lặp lại
 */
export enum RecurrenceFrequency {
  DAILY = 'DAILY', // Hàng ngày
  WEEKLY = 'WEEKLY', // Hàng tuần
  MONTHLY = 'MONTHLY', // Hàng tháng
  YEARLY = 'YEARLY', // Hàng năm
}

/**
 * Các ngày trong tuần
 */
export enum WeekDay {
  MONDAY = 'MO',
  TUESDAY = 'TU',
  WEDNESDAY = 'WE',
  THURSDAY = 'TH',
  FRIDAY = 'FR',
  SATURDAY = 'SA',
  SUNDAY = 'SU',
}

/**
 * Interface cho các tùy chọn hiển thị lịch
 */
export interface CalendarViewOptions {
  view: 'month' | 'week' | 'day' | 'agenda'; // Chế độ xem
  date: Date; // Ngày đang hiển thị
  showWeekends: boolean; // Hiển thị ngày cuối tuần hay không
  workHoursStart: number; // Giờ bắt đầu làm việc
  workHoursEnd: number; // Giờ kết thúc làm việc
  firstDayOfWeek: 0 | 1; // Ngày đầu tuần (0: Chủ Nhật, 1: Thứ Hai)
}
