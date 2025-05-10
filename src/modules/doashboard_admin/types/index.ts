// Định nghĩa các kiểu dữ liệu cho Dashboard Admin

// Thống kê tổng quan
export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  totalTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalRevenue: number;
  totalExpenses: number;

}

// Kiểu dữ liệu cho người dùng hoạt động
export interface ActiveUser {
  id: number;
  name: string;
  avatar?: string;
  lastActive: Date;
  role: string;
  department: string;
  isOnline: boolean;
}

// Kiểu dữ liệu cho thống kê theo thời gian (biểu đồ)
export interface TimeStats {
  period: string; // Ngày hoặc tháng, ví dụ "2023-06" hoặc "2023-06-15"
  newUsers: number;
  activeProjects: number;
  completedTasks: number;
  newTickets: number;
}

// Kiểu dữ liệu cho thông báo hệ thống
export interface SystemAlert {
  id: number;
  title: string;
  message: string;
  type: 'warning' | 'error' | 'info' | 'success';
  timestamp: Date;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

// Kiểu dữ liệu cho hoạt động hệ thống
export interface SystemActivity {
  id: number;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  action: string;
  targetType: 'project' | 'task' | 'user' | 'system' | 'report';
  targetId: number;
  targetName: string;
  timestamp: Date;
  details?: string;
}

// Kiểu dữ liệu cho phân bổ nhân sự
export interface ResourceAllocation {
  department: string;
  allocated: number; // Số nhân viên đã được phân công
  available: number; // Số nhân viên sẵn có
  overloaded: number; // Số nhân viên quá tải công việc
}

// Kiểu dữ liệu cho thống kê theo phòng ban
export interface DepartmentStats {
  name: string;
  totalEmployees: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  projectProgress: number; // Tỷ lệ % tiến độ trung bình
  taskCompletion: number; // Tỷ lệ % hoàn thành công việc
}

// Kiểu dữ liệu cho đề xuất gần đây
export interface RecentReport {
  id: number;
  title: string;
  submitBy: {
    id: number;
    name: string;
    avatar?: string;
  };
  submitDate: Date;
  type: 'expense' | 'time' | 'issue' | 'resource' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
}

// Kiểu dữ liệu cho dữ liệu biểu đồ tròn
export interface PieChartData {
  datasets: never[];
  labels: string[];
  values: number[];
  colors: string[];
}

// Kiểu dữ liệu cho dữ liệu biểu đồ cột/đường
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// Kiểu dữ liệu cho tình trạng hệ thống
export interface SystemStatus {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  databaseSize: number;
  lastBackup: Date;
  activeSessions: number;
  uptime: number; // thời gian hoạt động tính bằng giây
  status: 'healthy' | 'warning' | 'critical';
}


export interface DashboardAdminProps {

  stats: AdminStats;

  activeUsers: ActiveUser[];

  timeStats: TimeStats[];

  systemAlerts: SystemAlert[];

  resourceAllocation: ResourceAllocation[];

  departmentStats: DepartmentStats[];

  recentReports: RecentReport[];

  recentActivities: SystemActivity[];

  projectStatusChart?: PieChartData; // Made optional

  taskStatusChart: ChartData;

  userActivityChart: ChartData;

  systemStatus: SystemStatus;

}
