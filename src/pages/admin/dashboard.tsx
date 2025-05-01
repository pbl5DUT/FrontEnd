'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/layouts/Mainlayout';
import { UserRole } from '@/modules/auth/services/authService';
import { useDashboard } from '@/modules/doashboard_admin/hooks/userDashboard';
import { StatCard } from '@/modules/doashboard_admin/commponents/stat_card';
import { ChartContainer } from '@/modules/doashboard_admin/commponents/chart_container';
import { AlertsList } from '@/modules/doashboard_admin/commponents/alert_list';
import { ActivityFeed } from '@/modules/doashboard_admin/commponents/activity_feed';
import styles from './dashboard-admin.module.css';
import pageStyles from '@/styles/mainPage.module.css';

export default function DashboardAdmin() {
  const [dateRange, setDateRange] = useState<
    'today' | 'week' | 'month' | 'year'
  >('week');

  const {
    loading,
    error,
    stats,
    activeUsers,
    systemAlerts,
    recentActivities,
    projectStatusChart,
    taskStatusChart,
    userActivityChart,
    resourceAllocation,
    departmentStats,
    systemStatus,
    markAlertAsRead,
    refreshData,
    filterByDateRange,
  } = useDashboard();

  const handleDateRangeChange = (
    range: 'today' | 'week' | 'month' | 'year'
  ) => {
    setDateRange(range);

    // Tính toán khoảng thời gian
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    filterByDateRange(startDate, endDate);
  };

  if (loading) {
    return (
      <MainLayout title="Dashboard Admin" requiredRoles={[UserRole.ADMIN]}>
        <div className={pageStyles.pageContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Dashboard Admin" requiredRoles={[UserRole.ADMIN]}>
        <div className={pageStyles.pageContainer}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h2>Đã xảy ra lỗi</h2>
            <p>{error}</p>
            <button className={styles.retryButton} onClick={refreshData}>
              Thử lại
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard Admin" requiredRoles={[UserRole.ADMIN]}>
      <div className={pageStyles.pageContainer}>
        <div className={pageStyles.pageHeader}>
          <h1 className={pageStyles.pageTitle}>Dashboard Admin</h1>

          <div className={styles.headerActions}>
            <div className={styles.dateRangeSelector}>
              <button
                className={`${styles.dateRangeButton} ${
                  dateRange === 'today' ? styles.active : ''
                }`}
                onClick={() => handleDateRangeChange('today')}
              >
                Hôm nay
              </button>
              <button
                className={`${styles.dateRangeButton} ${
                  dateRange === 'week' ? styles.active : ''
                }`}
                onClick={() => handleDateRangeChange('week')}
              >
                7 ngày
              </button>
              <button
                className={`${styles.dateRangeButton} ${
                  dateRange === 'month' ? styles.active : ''
                }`}
                onClick={() => handleDateRangeChange('month')}
              >
                30 ngày
              </button>
              <button
                className={`${styles.dateRangeButton} ${
                  dateRange === 'year' ? styles.active : ''
                }`}
                onClick={() => handleDateRangeChange('year')}
              >
                Năm
              </button>
            </div>

            <button
              className={styles.refreshButton}
              onClick={refreshData}
              title="Làm mới dữ liệu"
            >
              ↻
            </button>
          </div>
        </div>

        <div className={styles.dashboardContent}>
          {/* Thống kê tổng quan */}
          <div className={styles.statsGrid}>
            {stats && (
              <>
                <StatCard
                  title="Tổng số người dùng"
                  value={stats.totalUsers}
                  color="primary"
                  percent={5}
                  isIncreasing={true}
                />
                <StatCard
                  title="Dự án đang thực hiện"
                  value={stats.activeProjects}
                  color="info"
                  percent={3}
                  isIncreasing={true}
                />
                <StatCard
                  title="Dự án hoàn thành"
                  value={stats.completedProjects}
                  color="success"
                  percent={8}
                  isIncreasing={true}
                />
                <StatCard
                  title="Dự án trễ hạn"
                  value={stats.delayedProjects}
                  color="danger"
                  percent={12}
                  isIncreasing={false}
                />
              </>
            )}
          </div>

          {/* Biểu đồ */}
          <div className={styles.chartsContainer}>
            {projectStatusChart && (
              <div className={styles.chartItem}>
                <ChartContainer
                  title="Trạng thái dự án"
                  type="pie"
                  data={projectStatusChart}
                  height={300}
                />
              </div>
            )}

            {taskStatusChart && (
              <div className={styles.chartItem}>
                <ChartContainer
                  title="Trạng thái công việc"
                  type="doughnut"
                  data={taskStatusChart}
                  height={300}
                />
              </div>
            )}

            {userActivityChart && (
              <div className={`${styles.chartItem} ${styles.fullWidth}`}>
                <ChartContainer
                  title="Hoạt động người dùng"
                  type="line"
                  data={userActivityChart}
                  height={300}
                />
              </div>
            )}
          </div>

          {/* Thông báo và hoạt động */}
          <div className={styles.feedsContainer}>
            {systemAlerts && (
              <div className={styles.feedItem}>
                <AlertsList
                  alerts={systemAlerts}
                  onMarkAsRead={markAlertAsRead}
                />
              </div>
            )}

            {recentActivities && (
              <div className={styles.feedItem}>
                <ActivityFeed activities={recentActivities} maxItems={5} />
              </div>
            )}
          </div>

          {/* Thông tin hệ thống */}
          {systemStatus && (
            <div className={styles.systemStatusSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Tình trạng hệ thống</h2>
              </div>

              <div className={styles.systemStatusGrid}>
                <div className={styles.statusItem}>
                  <h3>CPU</h3>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${systemStatus.cpuUsage}%`,
                        backgroundColor:
                          systemStatus.cpuUsage > 80
                            ? '#e74c3c'
                            : systemStatus.cpuUsage > 60
                            ? '#f39c12'
                            : '#2ecc71',
                      }}
                    ></div>
                  </div>
                  <div className={styles.statusValue}>
                    {systemStatus.cpuUsage}%
                  </div>
                </div>

                <div className={styles.statusItem}>
                  <h3>Bộ nhớ</h3>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${systemStatus.memoryUsage}%`,
                        backgroundColor:
                          systemStatus.memoryUsage > 80
                            ? '#e74c3c'
                            : systemStatus.memoryUsage > 60
                            ? '#f39c12'
                            : '#2ecc71',
                      }}
                    ></div>
                  </div>
                  <div className={styles.statusValue}>
                    {systemStatus.memoryUsage}%
                  </div>
                </div>

                <div className={styles.statusItem}>
                  <h3>Ổ đĩa</h3>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${systemStatus.diskUsage}%`,
                        backgroundColor:
                          systemStatus.diskUsage > 80
                            ? '#e74c3c'
                            : systemStatus.diskUsage > 60
                            ? '#f39c12'
                            : '#2ecc71',
                      }}
                    ></div>
                  </div>
                  <div className={styles.statusValue}>
                    {systemStatus.diskUsage}%
                  </div>
                </div>

                <div className={styles.statusItem}>
                  <h3>Database</h3>
                  <div className={styles.statusInfo}>
                    <span>
                      Kích thước:{' '}
                      {(systemStatus.databaseSize / 1024).toFixed(2)} GB
                    </span>
                    <span>
                      Sao lưu gần nhất:{' '}
                      {systemStatus.lastBackup.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className={styles.statusItem}>
                  <h3>Phiên làm việc</h3>
                  <div className={styles.statusInfo}>
                    <span>Đang hoạt động: {systemStatus.activeSessions}</span>
                    <span>
                      Thời gian hoạt động:{' '}
                      {Math.floor(systemStatus.uptime / 86400)} ngày
                    </span>
                  </div>
                </div>

                <div className={`${styles.statusItem} ${styles.statusOverall}`}>
                  <h3>Trạng thái tổng thể</h3>
                  <div
                    className={`${styles.statusBadge} ${
                      styles[systemStatus.status]
                    }`}
                  >
                    {systemStatus.status === 'healthy'
                      ? 'Tốt'
                      : systemStatus.status === 'warning'
                      ? 'Cảnh báo'
                      : 'Nghiêm trọng'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
