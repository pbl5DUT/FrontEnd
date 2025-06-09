// modules/admin/services/admin_services.ts
import { TaskStatus, TaskPriority } from '../../stacks/types/task';

import { UserRole } from '@/modules/auth/services/authService';
// Khai báo các types cần thiết
export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email: string;
  department?: string;
}

export interface Report {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userAvatar?: string;
  title: string;
  content: string;
  createdAt: string;
  status: 'PENDING' | 'REVIEWED' | 'REJECTED';
  projectName: string;
  taskStatus: TaskStatus;
  taskPriority: TaskPriority;
}

// Mock data cho ví dụ
const mockReports: Report[] = [
  {
    id: 'report1',
    taskId: 'task1',
    userId: 'user1',
    userName: 'Nguyễn Văn A',
    userRole: UserRole.USER,
    userAvatar: '/assets/avatars/user1.png',
    title: 'Báo cáo tiến độ dự án A',
    content: 'Đã hoàn thành 70% công việc. Dự kiến sẽ hoàn thành đúng hạn.',
    createdAt: new Date().toISOString(),
    status: 'PENDING',
    projectName: 'Dự án A',
    taskStatus: TaskStatus.IN_PROGRESS,
    taskPriority: TaskPriority.MEDIUM
  },
  {
    id: 'report2',
    taskId: 'task2',
    userId: 'user2',
    userName: 'Trần Thị B',
    userRole: UserRole.MANAGE,
    userAvatar: '/assets/avatars/user2.png',
    title: 'Báo cáo tổng hợp nhóm phát triển',
    content: 'Nhóm đã hoàn thành sprint 1. Cần bổ sung thêm nhân lực cho sprint 2.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'REVIEWED',
    projectName: 'Dự án B',
    taskStatus: TaskStatus.DONE,
    taskPriority: TaskPriority.HIGH
  },
  {
    id: 'report3',
    taskId: 'task3',
    userId: 'user3',
    userName: 'Lê Văn C',
    userRole: UserRole.USER,
    userAvatar: '/assets/avatars/user3.png',
    title: 'Báo cáo vấn đề phát sinh',
    content: 'Gặp trở ngại khi tích hợp API thanh toán. Cần thêm thời gian.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'REJECTED',
    projectName: 'Dự án C',
    taskStatus: TaskStatus.TODO,
    taskPriority: TaskPriority.HIGH
  },
  {
    id: 'report4',
    taskId: 'task4',
    userId: 'user4',
    userName: 'Phạm Thị D',
    userRole: UserRole.MANAGE,
    userAvatar: '/assets/avatars/user4.png',
    title: 'Báo cáo kết quả cuộc họp khách hàng',
    content: 'Khách hàng đã đồng ý với thiết kế mới và timeline điều chỉnh.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'PENDING',
    projectName: 'Dự án A',
    taskStatus: TaskStatus.IN_PROGRESS,
    taskPriority: TaskPriority.MEDIUM
  },
  {
    id: 'report5',
    taskId: 'task5',
    userId: 'user5',
    userName: 'Hoàng Văn E',
    userRole: UserRole.USER,
    userAvatar: '/assets/avatars/user5.png',
    title: 'Báo cáo lỗi hệ thống',
    content: 'Phát hiện lỗi bảo mật nghiêm trọng, cần vá gấp.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'PENDING',
    projectName: 'Dự án D',
    taskStatus: TaskStatus.TODO,
    taskPriority: TaskPriority.HIGH
  },
];

// Service API cho Admin
const adminService = {
  // Lấy tất cả báo cáo
  getAllReports: async (): Promise<Report[]> => {
    // Giả lập delay mạng
    await new Promise(resolve => setTimeout(resolve, 800));
    return [...mockReports];
  },

  // Lấy báo cáo theo vai trò người dùng
  getReportsByUserRole: async (role: UserRole): Promise<Report[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockReports.filter(report => report.userRole === role);
  },

  // Lấy báo cáo theo trạng thái
  getReportsByStatus: async (status: Report['status']): Promise<Report[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockReports.filter(report => report.status === status);
  },

  // Lấy báo cáo theo dự án
  getReportsByProject: async (projectName: string): Promise<Report[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockReports.filter(report => report.projectName === projectName);
  },

  // Cập nhật trạng thái báo cáo
  updateReportStatus: async (reportId: string, status: Report['status']): Promise<Report> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const reportIndex = mockReports.findIndex(report => report.id === reportId);
    if (reportIndex === -1) {
      throw new Error('Báo cáo không tồn tại');
    }
    
    mockReports[reportIndex] = {
      ...mockReports[reportIndex],
      status
    };
    
    return mockReports[reportIndex];
  },

  // Lấy danh sách dự án từ báo cáo
  getProjectsFromReports: async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return Array.from(new Set(mockReports.map(report => report.projectName)));
  }
};

export default adminService;