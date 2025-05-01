import {
  AdminStats,
  ActiveUser,
  TimeStats,
  SystemAlert,
  SystemActivity,
  ResourceAllocation,
  DepartmentStats,
  RecentReport,
  PieChartData,
  ChartData,
  SystemStatus,
} from '../types';
import axiosInstance from '@/services/axiosInstance';

// Service cho Dashboard Admin
export const dashboardService = {
  // Lấy thống kê tổng quan
  getAdminStats: async (): Promise<AdminStats> => {
    try {
      // Khi bạn sẵn sàng kết nối API, hãy bỏ comment dòng dưới
      // const response = await axiosInstance.get('/admin/stats');
      // return response.data;

      // Mô phỏng dữ liệu
      return {
        totalUsers: 150,
        totalProjects: 45,
        activeProjects: 28,
        completedProjects: 12,
        delayedProjects: 5,
        totalTasks: 324,
        pendingTasks: 87,
        overdueTasks: 23,
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  // Lấy danh sách người dùng đang hoạt động
  getActiveUsers: async (): Promise<ActiveUser[]> => {
    try {
      // const response = await axiosInstance.get('/admin/active-users');
      // return response.data;

      // Mô phỏng dữ liệu
      return [
        {
          id: 1,
          name: 'Nguyễn Văn A',
          avatar: '/assets/avatars/user1.jpg',
          lastActive: new Date(),
          role: 'Admin',
          department: 'IT',
          isOnline: true,
        },
        {
          id: 2,
          name: 'Trần Thị B',
          avatar: '/assets/avatars/user2.jpg',
          lastActive: new Date(Date.now() - 1000 * 60 * 5), // 5 phút trước
          role: 'Manager',
          department: 'Marketing',
          isOnline: true,
        },
        {
          id: 3,
          name: 'Lê Văn C',
          avatar: '/assets/avatars/user3.jpg',
          lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 phút trước
          role: 'User',
          department: 'HR',
          isOnline: false,
        },
      ];
    } catch (error) {
      console.error('Error fetching active users:', error);
      throw error;
    }
  },

  // Lấy thống kê theo thời gian
  getTimeStats: async (
    period: 'day' | 'week' | 'month' = 'week'
  ): Promise<TimeStats[]> => {
    try {
      // const response = await axiosInstance.get(`/admin/time-stats?period=${period}`);
      // return response.data;

      // Mô phỏng dữ liệu
      const stats: TimeStats[] = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const formatDate = (date: Date) => {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            '0'
          )}-${String(date.getDate()).padStart(2, '0')}`;
        };

        stats.push({
          period: formatDate(date),
          newUsers: Math.floor(Math.random() * 5),
          activeProjects: 20 + Math.floor(Math.random() * 10),
          completedTasks: 5 + Math.floor(Math.random() * 15),
          newTickets: Math.floor(Math.random() * 8),
        });
      }

      return stats;
    } catch (error) {
      console.error('Error fetching time stats:', error);
      throw error;
    }
  },

  // Lấy thông báo hệ thống
  getSystemAlerts: async (): Promise<SystemAlert[]> => {
    try {
      // const response = await axiosInstance.get('/admin/alerts');
      // return response.data;

      // Mô phỏng dữ liệu
      return [
        {
          id: 1,
          title: 'Dự án CRM sắp đến hạn',
          message:
            'Dự án CRM sẽ đến hạn trong 3 ngày nữa nhưng tiến độ mới đạt 75%',
          type: 'warning',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          isRead: false,
          priority: 'high',
        },
        {
          id: 2,
          title: 'Sao lưu dữ liệu thành công',
          message: 'Sao lưu dữ liệu tự động hoàn thành lúc 02:00 sáng nay',
          type: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
          isRead: true,
          priority: 'low',
        },
        {
          id: 3,
          title: 'Người dùng mới đăng ký',
          message: '5 người dùng mới đã đăng ký trong 24 giờ qua',
          type: 'info',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
          isRead: false,
          priority: 'medium',
        },
      ];
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      throw error;
    }
  },

  // Lấy hoạt động hệ thống gần đây
  getRecentActivities: async (): Promise<SystemActivity[]> => {
    try {
      // const response = await axiosInstance.get('/admin/activities');
      // return response.data;

      // Mô phỏng dữ liệu
      return [
        {
          id: 1,
          user: {
            id: 1,
            name: 'Nguyễn Văn A',
            avatar: '/assets/avatars/user1.jpg',
          },
          action: 'đã tạo',
          targetType: 'project',
          targetId: 10,
          targetName: 'Dự án Website Bán hàng',
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
        },
        {
          id: 2,
          user: {
            id: 2,
            name: 'Trần Thị B',
            avatar: '/assets/avatars/user2.jpg',
          },
          action: 'đã cập nhật',
          targetType: 'task',
          targetId: 45,
          targetName: 'Thiết kế giao diện trang chủ',
          timestamp: new Date(Date.now() - 1000 * 60 * 25),
        },
        {
          id: 3,
          user: {
            id: 3,
            name: 'Lê Văn C',
            avatar: '/assets/avatars/user3.jpg',
          },
          action: 'đã hoàn thành',
          targetType: 'task',
          targetId: 32,
          targetName: 'Tối ưu hóa database',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
        },
      ];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  // Lấy phân bổ nhân sự
  getResourceAllocation: async (): Promise<ResourceAllocation[]> => {
    try {
      // const response = await axiosInstance.get('/admin/resource-allocation');
      // return response.data;

      // Mô phỏng dữ liệu
      return [
        {
          department: 'IT',
          allocated: 18,
          available: 20,
          overloaded: 5,
        },
        {
          department: 'Marketing',
          allocated: 12,
          available: 15,
          overloaded: 2,
        },
        {
          department: 'Sales',
          allocated: 9,
          available: 10,
          overloaded: 0,
        },
        {
          department: 'HR',
          allocated: 4,
          available: 5,
          overloaded: 0,
        },
      ];
    } catch (error) {
      console.error('Error fetching resource allocation:', error);
      throw error;
    }
  },

  // Lấy thống kê theo phòng ban
  getDepartmentStats: async (): Promise<DepartmentStats[]> => {
    try {
      // const response = await axiosInstance.get('/admin/department-stats');
      // return response.data;

      // Mô phỏng dữ liệu
      return [
        {
          name: 'IT',
          totalEmployees: 20,
          activeProjects: 12,
          completedProjects: 8,
          delayedProjects: 2,
          projectProgress: 75,
          taskCompletion: 82,
        },
        {
          name: 'Marketing',
          totalEmployees: 15,
          activeProjects: 8,
          completedProjects: 5,
          delayedProjects: 1,
          projectProgress: 68,
          taskCompletion: 79,
        },
        {
          name: 'Sales',
          totalEmployees: 10,
          activeProjects: 5,
          completedProjects: 4,
          delayedProjects: 0,
          projectProgress: 85,
          taskCompletion: 90,
        },
        {
          name: 'HR',
          totalEmployees: 5,
          activeProjects: 3,
          completedProjects: 2,
          delayedProjects: 0,
          projectProgress: 90,
          taskCompletion: 95,
        },
      ];
    } catch (error) {
      console.error('Error fetching department stats:', error);
      throw error;
    }
  },

  // Lấy báo cáo gần đây
  getRecentReports: async (): Promise<RecentReport[]> => {
    try {
      // const response = await axiosInstance.get('/admin/recent-reports');
      // return response.data;

      // Mô phỏng dữ liệu
      return [
        {
          id: 1,
          title: 'Báo cáo chi phí dự án CRM',
          submitBy: {
            id: 2,
            name: 'Trần Thị B',
            avatar: '/assets/avatars/user2.jpg',
          },
          submitDate: new Date(Date.now() - 1000 * 60 * 60 * 5),
          type: 'expense',
          status: 'pending',
          priority: 'high',
        },
        {
          id: 2,
          title: 'Báo cáo thời gian làm việc tháng 6',
          submitBy: {
            id: 3,
            name: 'Lê Văn C',
            avatar: '/assets/avatars/user3.jpg',
          },
          submitDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
          type: 'time',
          status: 'approved',
          priority: 'medium',
        },
        {
          id: 3,
          title: 'Đề xuất tài nguyên cho dự án mới',
          submitBy: {
            id: 4,
            name: 'Phạm Thị D',
            avatar: '/assets/avatars/user4.jpg',
          },
          submitDate: new Date(Date.now() - 1000 * 60 * 60 * 48),
          type: 'resource',
          status: 'pending',
          priority: 'medium',
        },
      ];
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      throw error;
    }
  },

  // Lấy dữ liệu cho biểu đồ trạng thái dự án
  getProjectStatusChart: async (): Promise<PieChartData> => {
    try {
      // const response = await axiosInstance.get('/admin/charts/project-status');
      // return response.data;

      // Mô phỏng dữ liệu
      return {
        labels: ['Đang thực hiện', 'Hoàn thành', 'Trễ hạn', 'Tạm dừng'],
        values: [28, 12, 5, 3],
        colors: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12'],
      };
    } catch (error) {
      console.error('Error fetching project status chart:', error);
      throw error;
    }
  },

  // Lấy dữ liệu cho biểu đồ trạng thái công việc
  getTaskStatusChart: async (): Promise<PieChartData> => {
    try {
      // const response = await axiosInstance.get('/admin/charts/task-status');
      // return response.data;

      // Mô phỏng dữ liệu
      return {
        labels: ['Chưa bắt đầu', 'Đang thực hiện', 'Đã hoàn thành', 'Trễ hạn'],
        values: [45, 128, 151, 23],
        colors: ['#9b59b6', '#3498db', '#2ecc71', '#e74c3c'],
      };
    } catch (error) {
      console.error('Error fetching task status chart:', error);
      throw error;
    }
  },

  // Lấy dữ liệu cho biểu đồ hoạt động người dùng
  getUserActivityChart: async (): Promise<ChartData> => {
    try {
      // const response = await axiosInstance.get('/admin/charts/user-activity');
      // return response.data;

      // Mô phỏng dữ liệu
      return {
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        datasets: [
          {
            label: 'Số lượng đăng nhập',
            data: [65, 72, 78, 75, 82, 45, 32],
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            borderColor: 'rgba(52, 152, 219, 1)',
          },
          {
            label: 'Nhiệm vụ hoàn thành',
            data: [28, 35, 42, 31, 38, 15, 12],
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            borderColor: 'rgba(46, 204, 113, 1)',
          },
        ],
      };
    } catch (error) {
      console.error('Error fetching user activity chart:', error);
      throw error;
    }
  },

  // Lấy tình trạng hệ thống
  getSystemStatus: async (): Promise<SystemStatus> => {
    try {
      // const response = await axiosInstance.get('/admin/system-status');
      // return response.data;

      // Mô phỏng dữ liệu
      return {
        cpuUsage: 42,
        memoryUsage: 65,
        diskUsage: 58,
        databaseSize: 1250, // MB
        lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 giờ trước
        activeSessions: 35,
        uptime: 604800, // 1 tuần (tính bằng giây)
        status: 'healthy',
      };
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw error;
    }
  },

  // Lấy tất cả dữ liệu cho dashboard
  getAllDashboardData: async () => {
    try {
      const [
        stats,
        activeUsers,
        timeStats,
        systemAlerts,
        recentActivities,
        resourceAllocation,
        departmentStats,
        recentReports,
        projectStatusChart,
        taskStatusChart,
        userActivityChart,
        systemStatus,
      ] = await Promise.all([
        dashboardService.getAdminStats(),
        dashboardService.getActiveUsers(),
        dashboardService.getTimeStats(),
        dashboardService.getSystemAlerts(),
        dashboardService.getRecentActivities(),
        dashboardService.getResourceAllocation(),
        dashboardService.getDepartmentStats(),
        dashboardService.getRecentReports(),
        dashboardService.getProjectStatusChart(),
        dashboardService.getTaskStatusChart(),
        dashboardService.getUserActivityChart(),
        dashboardService.getSystemStatus(),
      ]);

      return {
        stats,
        activeUsers,
        timeStats,
        systemAlerts,
        recentActivities,
        resourceAllocation,
        departmentStats,
        recentReports,
        projectStatusChart,
        taskStatusChart,
        userActivityChart,
        systemStatus,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },
};
