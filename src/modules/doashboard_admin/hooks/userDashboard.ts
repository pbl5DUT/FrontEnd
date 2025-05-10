import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/doashboard_service';
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
  DashboardAdminProps,
} from '../types';

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] =
    useState<DashboardAdminProps | null>(null);

  // Lấy tất cả dữ liệu dashboard
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getAllDashboardData();

      // Ensure taskStatusChart conforms to ChartData
      const updatedData = {
        ...data,
        taskStatusChart: {
          ...data.taskStatusChart,
          datasets: data.taskStatusChart?.datasets || [],
        },
      };

      setDashboardData(updatedData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Đánh dấu thông báo đã đọc
  const markAlertAsRead = useCallback(
    async (alertId: number) => {
      if (!dashboardData) return;

      try {
        // Mô phỏng API call
        // await axiosInstance.put(`/admin/alerts/${alertId}/read`);

        // Cập nhật state
        const updatedAlerts = dashboardData.systemAlerts.map((alert) =>
          alert.id === alertId ? { ...alert, isRead: true } : alert
        );

        setDashboardData({
          ...dashboardData,
          systemAlerts: updatedAlerts,
        });
      } catch (err) {
        console.error('Error marking alert as read:', err);
        setError('Không thể cập nhật trạng thái thông báo');
      }
    },
    [dashboardData]
  );

  // Lọc dữ liệu theo khoảng thời gian
  const filterByDateRange = useCallback(
    async (startDate: Date, endDate: Date) => {
      try {
        setLoading(true);
        setError(null);

        // Mô phỏng API call với tham số ngày
        // const data = await dashboardService.getAllDashboardData(startDate, endDate);

        // Giả lập dữ liệu đã lọc
        const mockFilteredData: DashboardAdminProps = {
          stats: dashboardData?.stats || {
            totalUsers: 0,
            totalProjects: 0,
            activeProjects: 0,
            completedProjects: 0,
            pendingTasks: 0,
            overdueTasks: 0,
            totalRevenue: 0,
            totalExpenses: 0,
            delayedProjects: 0,
            totalTasks: 0
          },
          activeUsers: dashboardData?.activeUsers || [],
          timeStats: dashboardData?.timeStats || [],
          systemAlerts: dashboardData?.systemAlerts || [],
          resourceAllocation: dashboardData?.resourceAllocation || [],
          departmentStats: dashboardData?.departmentStats || [],
          recentReports: dashboardData?.recentReports || [],
          recentActivities: [],
          projectStatusChart: undefined,
          taskStatusChart: {
            labels: [],
            datasets: [],
          },
          userActivityChart: {
            labels: [],
            datasets: [],
          },
          systemStatus: {
            cpuUsage: 0,
            memoryUsage: 0,
            diskUsage: 0,
            databaseSize: 0,
            lastBackup: new Date(),
            activeSessions: 0,
            uptime: 0,
            status: 'healthy',
          }
        };

        // Trong ứng dụng thực tế, dữ liệu sẽ được lấy từ API với tham số ngày
        setTimeout(() => {
          if (mockFilteredData) {
            setDashboardData(mockFilteredData);
          }
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error filtering dashboard data:', err);
        setError('Không thể lọc dữ liệu theo khoảng thời gian');
        setLoading(false);
      }
    },
    [dashboardData]
  );

  // Làm mới dữ liệu
  const refreshData = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  // Lấy dữ liệu khi component được mount
  useEffect(() => {
    fetchDashboardData();

    // Mô phỏng việc tự động làm mới dữ liệu mỗi 5 phút
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchDashboardData]);

  return {
    loading,
    error,
    ...dashboardData,
    markAlertAsRead,
    filterByDateRange,
    refreshData,
  };
};
