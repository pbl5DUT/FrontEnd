// modules/admin/components/AdminReports.tsx
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../stacks/types/task';
import styles from '../styles/Admin.module.css';

import { UserRole } from '@/modules/auth/services/authService';
interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface Report {
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

interface AdminReportsProps {
  // Có thể thêm props nếu cần
}

const AdminReports: React.FC<AdminReportsProps> = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<Report['status'] | 'ALL'>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [projects, setProjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // Đây là nơi bạn sẽ gọi API để lấy danh sách báo cáo
        // Ví dụ: const data = await adminService.getAllReports();
        
        // Vì chưa có API thực, tôi sẽ tạo dữ liệu mẫu
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

        setReports(mockReports);
        setFilteredReports(mockReports);
        
        // Extract unique project names
        const uniqueProjects = Array.from(new Set(mockReports.map(report => report.projectName)));
        setProjects(uniqueProjects);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    // Filter reports based on selected filters
    let result = [...reports];

    // Filter by role
    if (roleFilter !== 'ALL') {
      result = result.filter(report => report.userRole === roleFilter);
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      result = result.filter(report => report.status === statusFilter);
    }

    // Filter by project
    if (projectFilter !== 'ALL') {
      result = result.filter(report => report.projectName === projectFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        report => 
          report.title.toLowerCase().includes(term) || 
          report.content.toLowerCase().includes(term) ||
          report.userName.toLowerCase().includes(term)
      );
    }

    setFilteredReports(result);
  }, [reports, roleFilter, statusFilter, projectFilter, searchTerm]);

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
  };

  const handleCloseDetail = () => {
    setSelectedReport(null);
  };

  const handleUpdateReportStatus = async (reportId: string, newStatus: Report['status']) => {
    try {
      // Đây là nơi bạn sẽ gọi API để cập nhật trạng thái báo cáo
      // Ví dụ: await adminService.updateReportStatus(reportId, newStatus);
      
      // Cập nhật state local
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
      
      // Cập nhật báo cáo được chọn nếu đang xem
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({
          ...selectedReport,
          status: newStatus
        });
      }
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.MANAGE:
        return 'Quản lý';
      case UserRole.USER:
        return 'Nhân viên';
      default:
        return role;
    }
  };

  const getStatusLabel = (status: Report['status']) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xem xét';
      case 'REVIEWED':
        return 'Đã xem xét';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const getTaskStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'Todo';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.DONE:
        return 'Done';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'Thấp';
      case TaskPriority.MEDIUM:
        return 'Trung bình';
      case TaskPriority.HIGH:
        return 'Cao';
      default:
        return priority;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải báo cáo...</div>;
  }

  return (
    <div className={styles.adminReportsContainer}>
      <div className={styles.reportsHeader}>
        <h1 className={styles.pageTitle}>Báo cáo công việc</h1>
        
        <div className={styles.filterControls}>
          <div className={styles.searchBox}>
            <input 
              type="text"
              placeholder="Tìm kiếm báo cáo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filterGroup}>
            <label htmlFor="roleFilter">Vai trò:</label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
              className={styles.filterSelect}
            >
              <option value="ALL">Tất cả</option>
              <option value={UserRole.MANAGE}>{getRoleLabel(UserRole.MANAGE)}</option>
              <option value={UserRole.USER}>{getRoleLabel(UserRole.USER)}</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label htmlFor="statusFilter">Trạng thái:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Report['status'] | 'ALL')}
              className={styles.filterSelect}
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">{getStatusLabel('PENDING')}</option>
              <option value="REVIEWED">{getStatusLabel('REVIEWED')}</option>
              <option value="REJECTED">{getStatusLabel('REJECTED')}</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label htmlFor="projectFilter">Dự án:</label>
            <select
              id="projectFilter"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="ALL">Tất cả</option>
              {projects.map((project) => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.reportsContent}>
        <div className={`${styles.reportsList} ${selectedReport ? styles.withSelectedReport : ''}`}>
          {filteredReports.length === 0 ? (
            <div className={styles.emptyList}>
              <p>Không có báo cáo nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <div className={styles.reportsTable}>
              <table>
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Người gửi</th>
                    <th>Vai trò</th>
                    <th>Dự án</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className={`${styles.reportRow} ${selectedReport?.id === report.id ? styles.selected : ''}`}
                      onClick={() => handleReportClick(report)}
                    >
                      <td className={styles.reportTitle}>{report.title}</td>
                      <td className={styles.reportUser}>
                        <div className={styles.userInfo}>
                          <div className={styles.userAvatar}>
                            {report.userAvatar || report.userName.charAt(0)}
                          </div>
                          <span>{report.userName}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.roleBadge} ${styles[`role${report.userRole}`]}`}>
                          {getRoleLabel(report.userRole)}
                        </span>
                      </td>
                      <td>{report.projectName}</td>
                      <td>{formatDate(report.createdAt)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[`status${report.status}`]}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedReport && (
          <div className={styles.reportDetail}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>{selectedReport.title}</h2>
              <button className={styles.closeButton} onClick={handleCloseDetail}>×</button>
            </div>

            <div className={styles.detailContent}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Thông tin người gửi</h3>
                <div className={styles.reporterInfo}>
                  <div className={styles.reporterAvatar}>
                    {selectedReport.userAvatar || selectedReport.userName.charAt(0)}
                  </div>
                  <div className={styles.reporterDetails}>
                    <div className={styles.reporterName}>{selectedReport.userName}</div>
                    <div className={styles.reporterRole}>
                      <span className={`${styles.roleBadge} ${styles[`role${selectedReport.userRole}`]}`}>
                        {getRoleLabel(selectedReport.userRole)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.reportDate}>
                    Ngày gửi: {formatDate(selectedReport.createdAt)}
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Nội dung báo cáo</h3>
                <div className={styles.reportContent}>
                  {selectedReport.content}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Thông tin công việc</h3>
                <div className={styles.taskInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Dự án:</span>
                    <span className={styles.infoValue}>{selectedReport.projectName}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Trạng thái công việc:</span>
                    <span className={`${styles.taskStatusBadge} ${styles[`taskStatus${selectedReport.taskStatus}`]}`}>
                      {getTaskStatusLabel(selectedReport.taskStatus)}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Độ ưu tiên:</span>
                    <span className={`${styles.priorityBadge} ${styles[`priority${selectedReport.taskPriority}`]}`}>
                      {getPriorityLabel(selectedReport.taskPriority)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Hành động</h3>
                <div className={styles.actionButtons}>
                  <button
                    className={`${styles.actionButton} ${styles.reviewButton}`}
                    onClick={() => handleUpdateReportStatus(selectedReport.id, 'REVIEWED')}
                    disabled={selectedReport.status === 'REVIEWED'}
                  >
                    {selectedReport.status === 'REVIEWED' ? 'Đã xem xét' : 'Đánh dấu đã xem'}
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.rejectButton}`}
                    onClick={() => handleUpdateReportStatus(selectedReport.id, 'REJECTED')}
                    disabled={selectedReport.status === 'REJECTED'}
                  >
                    {selectedReport.status === 'REJECTED' ? 'Đã từ chối' : 'Từ chối báo cáo'}
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.resetButton}`}
                    onClick={() => handleUpdateReportStatus(selectedReport.id, 'PENDING')}
                    disabled={selectedReport.status === 'PENDING'}
                  >
                    Đặt lại trạng thái
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;