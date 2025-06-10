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
  // State initialization
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
    totalPages: number;
    pageSize: number;
  }>({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
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
          page_size: pagination.pageSize,
        });

        // Handle raw array response from backend
        const fetchedReports = Array.isArray(response) ? response : [];
        const totalItems = fetchedReports.length;
        const hasNext = totalItems === pagination.pageSize;
        const hasPrevious = page > 1;
        const estimatedTotal = page * pagination.pageSize;

        setReports((prev) => (append ? [...prev, ...fetchedReports] : fetchedReports));
        setPagination((prev) => ({
          ...prev,
          count: estimatedTotal,
          next: hasNext ? `/api/workreports/?user_id=${userId}&page=${page + 1}&page_size=${pagination.pageSize}` : null,
          previous: hasPrevious ? `/api/workreports/?user_id=${userId}&page=${page - 1}&page_size=${pagination.pageSize}` : null,
          currentPage: page,
          totalPages: Math.ceil(estimatedTotal / pagination.pageSize) || 1,
        }));
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.error || error.message || 'Không thể tải báo cáo. Vui lòng thử lại.';
        setError(errorMessage);
        setReports([]);
      } finally {
        setLoading(false);
      }
    },
    [userId, filter, pagination.pageSize]
  );

  // Fetch reports on mount or when filters/userId/pageSize change
  useEffect(() => {
    if (userId) {
      fetchReports(1);
    }
  }, [userId, filter, pagination.pageSize, fetchReports]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= pagination.totalPages) {
      fetchReports(page);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value);
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: 1,
      next: null,
      previous: null,
    }));
  };

  const handleLoadMore = () => {
    if (pagination.next) {
      const nextPage = new URL(pagination.next).searchParams.get('page');
      if (nextPage) fetchReports(parseInt(nextPage), false);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      const prevPage = new URL(pagination.previous).searchParams.get('page');
      if (prevPage) fetchReports(parseInt(prevPage), false);
    }
  };

  // Handle report selection with better event handling
  const handleReportClick = (report: WorkReport, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Report clicked:', report.id); // Debug log
    onSelectReport(report);
  };

  const handleReportKeyPress = (report: WorkReport, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      console.log('Report selected via keyboard:', report.id); // Debug log
      onSelectReport(report);
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
          <select
            value={pagination.pageSize}
            onChange={handlePageSizeChange}
            className={styles.filterSelect}
            aria-label="Số mục trên trang"
          >
            <option value={5}>5 mục/trang</option>
            <option value={10}>10 mục/trang</option>
            <option value={20}>20 mục/trang</option>
          </select>
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
                onClick={(e) => handleReportClick(report, e)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => handleReportKeyPress(report, e)}
                style={{ cursor: 'pointer' }}
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
            <select
              value={pagination.currentPage}
              onChange={(e) => handlePageChange(parseInt(e.target.value))}
              className={styles.paginationSelect}
              aria-label="Chọn trang"
            >
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
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