// modules/stacks/components/ReportsList.tsx - ✅ Fully aligned with BE WorkReportViewSet
import React, { useState, useEffect, useCallback } from 'react';
import { WorkReport, ReportType, ReportStatus } from '../types/report';
import styles from '../styles/Reports.module.css';
import reportService from '../services/report_service';

interface ReportsListProps {
  userId: string;
  onSelectReport: (report: WorkReport) => void;
  onCreateReport: () => void;
}

const ReportsList: React.FC<ReportsListProps> = ({ userId, onSelectReport, onCreateReport }) => {
  // State initialization with default empty array to avoid undefined errors
  const [reports, setReports] = useState<WorkReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    type: ReportType | 'ALL';
    status: ReportStatus | 'ALL';
    projectId?: string;
  }>({
    type: 'ALL',
    status: 'ALL',
  });
  const [pagination, setPagination] = useState<{
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
  }>({
    count: 0, // Will be updated based on total items fetched
    next: null,
    previous: null,
    currentPage: 1,
  });

  // Fetch reports with memoized function
  const fetchReports = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        const response = await reportService.getUserReportsWithFilters(userId, {
          type: filter.type !== 'ALL' ? filter.type : undefined,
          status: filter.status !== 'ALL' ? filter.status : undefined,
          project_id: filter.projectId,
          page,
          page_size: 10, // Adjusted for better initial load
        });

        // Handle raw array response from backend
        const fetchedReports = Array.isArray(response) ? response : [];
        const totalItems = fetchedReports.length; // Assume total count is the length for now (adjust if backend provides total)
        const hasNext = totalItems === 10; // Assume next page exists if exactly 10 items are returned
        const hasPrevious = page > 1;

        setReports((prev) => (append ? [...prev, ...fetchedReports] : fetchedReports));
        setPagination({
          count: totalItems, // Update with actual total if backend provides it
          next: hasNext ? `/api/workreports/?user_id=${userId}&page=${page + 1}&page_size=10` : null,
          previous: hasPrevious ? `/api/workreports/?user_id=${userId}&page=${page - 1}&page_size=10` : null,
          currentPage: page,
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.error || error.message || 'Không thể tải báo cáo. Vui lòng thử lại.';
        setError(errorMessage);
        setReports([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    },
    [userId, filter]
  );

  // Fetch reports on mount or when filters/userId change
  useEffect(() => {
    if (userId) {
      fetchReports(1);
    }
  }, [userId, filter, fetchReports]);

  // Handle pagination
  const handleLoadMore = () => {
    if (pagination.next) {
      const nextPage = new URL(pagination.next).searchParams.get('page');
      if (nextPage) fetchReports(parseInt(nextPage), true);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      const prevPage = new URL(pagination.previous).searchParams.get('page');
      if (prevPage) fetchReports(parseInt(prevPage));
    }
  };

  // Utility functions
  const getReportTypeName = (type: ReportType) => {
    const typeMap: Record<ReportType, string> = {
      [ReportType.DAILY]: 'Báo cáo ngày',
      [ReportType.WEEKLY]: 'Báo cáo tuần',
      [ReportType.MONTHLY]: 'Báo cáo tháng',
      [ReportType.PROJECT]: 'Báo cáo dự án',
    };
    return typeMap[type] || 'Không xác định';
  };

  const getStatusBadge = (status: ReportStatus) => {
    const badgeMap: Record<ReportStatus, string> = {
      [ReportStatus.DRAFT]: 'Nháp',
      [ReportStatus.SUBMITTED]: 'Đã gửi',
      [ReportStatus.REVIEWED]: 'Đã xem',
    };
    const classMap: Record<ReportStatus, string> = {
      [ReportStatus.DRAFT]: styles.statusDraft,
      [ReportStatus.SUBMITTED]: styles.statusSubmitted,
      [ReportStatus.REVIEWED]: styles.statusReviewed,
    };
    return (
      <span className={`${styles.statusBadge} ${classMap[status] || ''}`}>
        {badgeMap[status] || 'Không xác định'}
      </span>
    );
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Ngày không hợp lệ';
      const formatter = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      return `${formatter.format(start)} - ${formatter.format(end)}`;
    } catch {
      return 'Ngày không hợp lệ';
    }
  };

  // Loading state with skeleton UI
  if (loading && reports.length === 0) {
    return (
      <div className={styles.reportsContainer}>
        <div className={styles.loading}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonTable}>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className={styles.skeletonRow} />
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.reportsContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>
            <h3>❌ Lỗi</h3>
            <p>{error}</p>
            <button onClick={() => fetchReports(1)} className={styles.retryButton}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.reportsContainer}>
      {/* Filters and Create Button */}
      <div className={styles.reportsHeader}>
        <div className={styles.filterContainer}>
          <select
            value={filter.type}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, type: e.target.value as ReportType | 'ALL' }))
            }
            className={styles.filterSelect}
            aria-label="Lọc theo loại báo cáo"
          >
            <option value="ALL">Tất cả ({pagination.count})</option>
            <option value={ReportType.DAILY}>{getReportTypeName(ReportType.DAILY)}</option>
            <option value={ReportType.WEEKLY}>{getReportTypeName(ReportType.WEEKLY)}</option>
            <option value={ReportType.MONTHLY}>{getReportTypeName(ReportType.MONTHLY)}</option>
            <option value={ReportType.PROJECT}>{getReportTypeName(ReportType.PROJECT)}</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, status: e.target.value as ReportStatus | 'ALL' }))
            }
            className={styles.filterSelect}
            aria-label="Lọc theo trạng thái"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value={ReportStatus.DRAFT}>Nháp</option>
            <option value={ReportStatus.SUBMITTED}>Đã gửi</option>
            <option value={ReportStatus.REVIEWED}>Đã xem</option>
          </select>
          <input
            type="text"
            placeholder="ID dự án..."
            value={filter.projectId || ''}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, projectId: e.target.value || undefined }))
            }
            className={styles.filterInput}
            aria-label="Lọc theo ID dự án"
          />
        </div>
        <button className={styles.createButton} onClick={onCreateReport} aria-label="Tạo báo cáo mới">
          <span>+</span> Tạo mới
        </button>
      </div>

      {/* Reports Table or Empty State */}
      {reports.length === 0 ? (
        <div className={styles.emptyState} role="alert">
          <p>
            Không có báo cáo nào{' '}
            {filter.type !== 'ALL' ? `loại ${getReportTypeName(filter.type)}` : ''}{' '}
            {filter.status !== 'ALL' ? `trạng thái ${filter.status}` : ''}{' '}
            {filter.projectId ? `dự án ${filter.projectId}` : ''}
          </p>
          <button className={styles.emptyStateButton} onClick={onCreateReport}>
            Tạo báo cáo mới
          </button>
        </div>
      ) : (
        <table className={styles.reportsTable} aria-label="Danh sách báo cáo">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Loại</th>
              <th>Thời gian</th>
              <th>Dự án</th>
              <th>Người tạo</th>
              <th>Số Tasks</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                className={styles.reportRow}
                onClick={() => onSelectReport(report)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && onSelectReport(report)}
              >
                <td className={styles.reportTitle}>{report.title || 'Chưa có tiêu đề'}</td>
                <td>{getReportTypeName(report.type)}</td>
                <td>{formatDateRange(report.start_date, report.end_date)}</td>
                <td>{report.project?.project_name || 'Tất cả dự án'}</td>
                <td>{report.user?.full_name || report.user?.username || 'Không xác định'}</td>
                <td>{report.tasks?.length || 0}</td>
                <td>{getStatusBadge(report.status)}</td>
                <td>
                  {report.updated_at
                    ? new Date(report.updated_at).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Chưa cập nhật'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination Controls */}
      {pagination.count > 0 && (
        <div className={styles.paginationInfo} role="navigation">
          <span>
            Hiển thị {reports.length} trong {pagination.count} báo cáo
          </span>
          <div className={styles.paginationControls}>
            <button
              onClick={handlePreviousPage}
              disabled={!pagination.previous}
              className={styles.paginationButton}
              aria-label="Trang trước"
            >
              ←
            </button>
            <span>Trang {pagination.currentPage}</span>
            <button
              onClick={handleLoadMore}
              disabled={!pagination.next}
              className={styles.paginationButton}
              aria-label="Trang sau"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsList;