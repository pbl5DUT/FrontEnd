// modules/stacks/components/ReportsList.tsx
import React, { useState, useEffect } from 'react';
import reportService from '../services/report_service_mock';
import { WorkReport, ReportStatus, ReportType } from '../types/report';
import styles from '../styles/Reports.module.css';

interface ReportsListProps {
  userId: string;
  onSelectReport: (report: WorkReport) => void;
  onCreateReport: () => void;
}

const ReportsList: React.FC<ReportsListProps> = ({
  userId,
  onSelectReport,
  onCreateReport,
}) => {
  const [reports, setReports] = useState<WorkReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<ReportType | 'ALL'>('ALL');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const userReports = await reportService.getUserReports(userId);
        setReports(userReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId]);

  const getReportTypeName = (type: ReportType) => {
    switch (type) {
      case ReportType.DAILY:
        return 'Báo cáo ngày';
      case ReportType.WEEKLY:
        return 'Báo cáo tuần';
      case ReportType.MONTHLY:
        return 'Báo cáo tháng';
      case ReportType.PROJECT:
        return 'Báo cáo dự án';
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.DRAFT:
        return (
          <span className={`${styles.statusBadge} ${styles.statusDraft}`}>
            Nháp
          </span>
        );
      case ReportStatus.SUBMITTED:
        return (
          <span className={`${styles.statusBadge} ${styles.statusSubmitted}`}>
            Đã gửi
          </span>
        );
      case ReportStatus.REVIEWED:
        return (
          <span className={`${styles.statusBadge} ${styles.statusReviewed}`}>
            Đã xem
          </span>
        );
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatter = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return `${formatter.format(start)} - ${formatter.format(end)}`;
  };

  const filteredReports =
    filter === 'ALL'
      ? reports
      : reports.filter((report) => report.type === filter);

  if (loading) {
    return <div className={styles.loading}>Đang tải báo cáo...</div>;
  }

  return (
    <div className={styles.reportsContainer}>
      <div className={styles.reportsHeader}>
        <div className={styles.filterContainer}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ReportType | 'ALL')}
            className={styles.filterSelect}
          >
            <option value="ALL">Tất cả báo cáo</option>
            <option value={ReportType.DAILY}>
              {getReportTypeName(ReportType.DAILY)}
            </option>
            <option value={ReportType.WEEKLY}>
              {getReportTypeName(ReportType.WEEKLY)}
            </option>
            <option value={ReportType.MONTHLY}>
              {getReportTypeName(ReportType.MONTHLY)}
            </option>
            <option value={ReportType.PROJECT}>
              {getReportTypeName(ReportType.PROJECT)}
            </option>
          </select>
        </div>
        <button className={styles.createButton} onClick={onCreateReport}>
          <span>+</span> Tạo báo cáo mới
        </button>
      </div>

      {filteredReports.length === 0 ? (
        <div className={styles.emptyState}>
          <p>
            Không có báo cáo nào{' '}
            {filter !== 'ALL' ? `loại ${getReportTypeName(filter)}` : ''}
          </p>
          <button className={styles.emptyStateButton} onClick={onCreateReport}>
            Tạo báo cáo mới
          </button>
        </div>
      ) : (
        <table className={styles.reportsTable}>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Loại báo cáo</th>
              <th>Thời gian</th>
              <th>Dự án</th>
              <th>Trạng thái</th>
              <th>Ngày cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr
                key={report.id}
                className={styles.reportRow}
                onClick={() => onSelectReport(report)}
              >
                <td className={styles.reportTitle}>{report.title}</td>
                <td>{getReportTypeName(report.type)}</td>
                <td>{formatDateRange(report.startDate, report.endDate)}</td>
                <td>{report.projectName || 'Tất cả dự án'}</td>
                <td>{getStatusBadge(report.status)}</td>
                <td>{new Date(report.updatedAt).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReportsList;
