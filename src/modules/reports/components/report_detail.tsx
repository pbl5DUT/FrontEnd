import React, { useState } from 'react';
import reportService from '../services/report_service';
import {
  WorkReport,
  ReportStatus,
  ReportType,
  ReportTask,
  TaskStatus,
} from '../types/report';
import styles from '../styles/report_detail.module.css';

interface ReportDetailProps {
  report: WorkReport;
  onClose: () => void;
  onReportUpdated: () => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ report, onClose, onReportUpdated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

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
      default:
        return type;
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.DRAFT:
        return <span className={`${styles.statusBadge} ${styles.statusDraft}`}>Nháp</span>;
      case ReportStatus.SUBMITTED:
        return <span className={`${styles.statusBadge} ${styles.statusSubmitted}`}>Đã gửi</span>;
      case ReportStatus.REVIEWED:
        return <span className={`${styles.statusBadge} ${styles.statusReviewed}`}>Đã xem</span>;
      default:
        return <span className={styles.statusBadge}>{status}</span>;
    }
  };

  const handleSubmitReport = async () => {
    if (report.status !== ReportStatus.DRAFT) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await reportService.submitReport(report.id);
      onReportUpdated();
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Không thể gửi báo cáo: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReport = async () => {
    if (report.status !== ReportStatus.DRAFT) return;

    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa báo cáo này không?');
    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      setError(null);
      await reportService.deleteReport(report.id);
      onClose();
      onReportUpdated();
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Không thể xóa báo cáo: ' + (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTotalTimeSpent = (tasks: ReportTask[]) => {
    return tasks.reduce((total, task) => total + (task.time_spent || 0), 0);
  };

  const getAverageProgress = (tasks: ReportTask[]) => {
    if (tasks.length) return 0;
    const totalProgress = tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
    return Math.round(totalProgress / tasks.length);
  };

  if (!report) {
    return (
      <div className={styles.reportsContainer}>
        <div className={styles.errorContainer}>
          <span className={styles.errorIcon}>⚠️</span>
          <h3 className={styles.sectionTitle}>Lỗi</h3>
          <p className={styles.sectionContent}>Báo cáo không tồn tại</p>
          <div className={styles.sectionActions}>
            <button className={styles.retryButton} onClick={onClose}>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.reportsContainer}>
      {error && (
        <div className={styles.errorContainer}>
          <span className={styles.errorIcon}>⚠️</span>
          <p className={styles.sectionContent}>{error}</p>
        </div>
      )}
      <div className={styles.reportDetailHeader}>
        <h2 className={styles.sectionTitle}>{report.title}</h2>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>

      <div className={styles.reportDetailContent}>
        <div className={styles.reportMeta}>
          <div className={styles.reportMetaItem}>
            <span className={styles.metaLabel}>Loại báo cáo:</span>
            <span className={styles.metaValue}>{getReportTypeName(report.type)}</span>
          </div>
          <div className={styles.reportMetaItem}>
            <span className={styles.metaLabel}>Thời gian:</span>
            <span className={styles.metaValue}>
              {new Date(report.start_date).toLocaleDateString('vi-VN')} -{' '}
              {new Date(report.end_date).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <div className={styles.reportMetaItem}>
            <span className={styles.metaLabel}>Dự án:</span>
            <span className={styles.metaValue}>
              {report.project?.project_name || 'Tất cả dự án'}
            </span>
          </div>
          <div className={styles.reportMetaItem}>
            <span className={styles.metaLabel}>Người tạo:</span>
            <span className={styles.metaValue}>
              {report.user?.full_name || 'Không xác định'}
            </span>
          </div>
          <div className={styles.reportMetaItem}>
            <span className={styles.metaLabel}>Trạng thái:</span>
            <span className={styles.metaValue}>{getStatusBadge(report.status)}</span>
          </div>
          {report.status === ReportStatus.SUBMITTED && report.submitted_date && (
            <div className={styles.reportMetaItem}>
              <span className={styles.metaLabel}>Đã gửi lúc:</span>
              <span className={styles.metaValue}>{formatDate(report.submitted_date)}</span>
            </div>
          )}
          {report.status === ReportStatus.REVIEWED && report.reviewed_date && (
            <div className={styles.reportMetaItem}>
              <span className={styles.metaLabel}>Đã xem lúc:</span>
              <span className={styles.metaValue}>{formatDate(report.reviewed_date)}</span>
            </div>
          )}
        </div>

        <div className={styles.reportStats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{(report.tasks || []).length}</span>
            <span className={styles.statLabel}>Công việc</span>
          </div>
          <div className={styles.statCard}>
            {/* <span className={styles.statValue}>{getTotalTimeSpent(report.tasks || []).toFixed(1)}h</span> */}
            <span className={styles.statLabel}>Thời gian làm việc</span>
          </div>
          <div className={styles.statCard}>
            {/* <span className={styles.statValue}>{getAverageProgress(report.tasks || [])}%</span> */}
            <span className={styles.statLabel}>Tiến độ trung bình</span>
          </div>
        </div>

        <div className={styles.reportSection}>
          <h3 className={styles.sectionTitle}>Tổng quan</h3>
          <p className={styles.sectionContent}>{report.summary || 'Chưa có nội dung'}</p>
        </div>

        {report.challenges && (
          <div className={styles.reportSection}>
            <h3 className={styles.sectionTitle}>Thách thức & khó khăn</h3>
            <p className={styles.sectionContent}>{report.challenges}</p>
          </div>
        )}

        {report.next_steps && (
          <div className={styles.reportSection}>
            <h3 className={styles.sectionTitle}>Kế hoạch tiếp theo</h3>
            <p className={styles.sectionContent}>{report.next_steps}</p>
          </div>
        )}

        <div className={styles.reportSection}>
          <h3 className={styles.sectionTitle}>Chi tiết công việc</h3>
          <table className={styles.tasksTable}>
            <thead>
              <tr>
                <th>Công việc</th>
                <th>Trạng thái</th>
                <th>Tiến độ</th>
                <th>Thời gian (giờ)</th>
              </tr>
            </thead>
            <tbody>
              {(report.tasks || []).map((task) => (
                <tr key={task.task_id}>
                  <td>
                    <div>{task.task_name}</div>
                    {task.notes && <div className={styles.taskNotes}>{task.notes}</div>}
                  </td>
                  <td>
                    {task.status === TaskStatus.TODO && (
                      <span className={styles.taskStatusTodo}>Todo</span>
                    )}
                    {task.status === TaskStatus.IN_PROGRESS && (
                      <span className={styles.taskStatusInProgress}>In Progress</span>
                    )}
                    {task.status === TaskStatus.DONE && (
                      <span className={styles.taskStatusDone}>Done</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${task.progress || 0}%` }}
                      ></div>
                      <span className={styles.progressText}>{task.progress || 0}%</span>
                    </div>
                  </td>
                  <td>{task.time_spent || 0}h</td>
                </tr>
              ))}
              {(report.tasks || []).length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    Không có công việc nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {report.status === ReportStatus.DRAFT && (
          <div className={styles.actionButtons}>
            <button
              className={styles.deleteButton}
              onClick={handleDeleteReport}
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa báo cáo'}
            </button>
            <button
              className={styles.submitButton}
              onClick={handleSubmitReport}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetail;