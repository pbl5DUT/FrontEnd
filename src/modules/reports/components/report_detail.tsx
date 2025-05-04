// modules/stacks/components/ReportDetail.tsx
import React, { useState } from 'react';
import reportService from '../services/report_service_mock';
import {
  WorkReport,
  ReportStatus,
  ReportType,
  ReportTask,
  TaskStatus,
} from '../types/report';
import styles from '../styles/Reports.module.css';

interface ReportDetailProps {
  report: WorkReport;
  onClose: () => void;
  onReportUpdated: () => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({
  report,
  onClose,
  onReportUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    }
  };

  const getStatusName = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.DRAFT:
        return 'Nháp';
      case ReportStatus.SUBMITTED:
        return 'Đã gửi';
      case ReportStatus.REVIEWED:
        return 'Đã xem';
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

  const handleSubmitReport = async () => {
    if (report.status !== ReportStatus.DRAFT) return;

    try {
      setIsSubmitting(true);
      await reportService.submitReport(report.id);
      onReportUpdated();
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReport = async () => {
    if (report.status !== ReportStatus.DRAFT) return;

    const confirmDelete = window.confirm(
      'Bạn có chắc chắn muốn xóa báo cáo này không?'
    );
    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      await reportService.deleteReport(report.id);
      onClose();
      onReportUpdated();
    } catch (error) {
      console.error('Error deleting report:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTotalTimeSpent = () => {
    return report.reportTasks.reduce(
      (total, task) => total + task.timeSpent,
      0
    );
  };

  const getAverageProgress = () => {
    if (report.reportTasks.length === 0) return 0;

    const totalProgress = report.reportTasks.reduce(
      (sum, task) => sum + task.progress,
      0
    );
    return Math.round(totalProgress / report.reportTasks.length);
  };

  return (
    <>
      <div className={styles.reportDetailHeader}>
        <h2 className={styles.reportDetailTitle}>{report.title}</h2>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>

      <div className={styles.reportDetailContent}>
        <div className={styles.reportMeta}>
          <div className={styles.reportMetaItem}>
            <span className={styles.metaLabel}>Loại báo cáo:</span>
            <span className={styles.metaValue}>
              {getReportTypeName(report.type)}
            </span>
          </div>
          <div className={styles.reportMetaItem}>
            <span className={styles.metaLabel}>Thời gian:</span>
            <span className={styles.metaValue}>
              {new Date(report.startDate).toLocaleDateString('vi-VN')} -{' '}
              {new Date(report.endDate).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <div className={styles.reportMetaItem}>
            <span className={styles.metaLabel}>Dự án:</span>
            <span className={styles.metaValue}>
              {report.projectName || 'Tất cả dự án'}
            </span>
          </div>
          <div className={styles.reportMetaItem}>
            <span className={styles.metaLabel}>Trạng thái:</span>
            <span className={styles.metaValue}>
              {getStatusBadge(report.status)}
            </span>
          </div>
          {report.status === ReportStatus.SUBMITTED && (
            <div className={styles.reportMetaItem}>
              <span className={styles.metaLabel}>Đã gửi lúc:</span>
              <span className={styles.metaValue}>
                {formatDate(report.submittedDate!)}
              </span>
            </div>
          )}
          {report.status === ReportStatus.REVIEWED && (
            <div className={styles.reportMetaItem}>
              <span className={styles.metaLabel}>Đã xem lúc:</span>
              <span className={styles.metaValue}>
                {formatDate(report.reviewedDate!)}
              </span>
            </div>
          )}
        </div>

        <div className={styles.reportStats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {report.reportTasks.length}
            </span>
            <span className={styles.statLabel}>Công việc</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {getTotalTimeSpent().toFixed(1)}h
            </span>
            <span className={styles.statLabel}>Thời gian làm việc</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{getAverageProgress()}%</span>
            <span className={styles.statLabel}>Tiến độ trung bình</span>
          </div>
        </div>

        <div className={styles.reportSection}>
          <h3 className={styles.sectionTitle}>Tổng quan</h3>
          <p className={styles.sectionContent}>{report.summary}</p>
        </div>

        {report.challenges && (
          <div className={styles.reportSection}>
            <h3 className={styles.sectionTitle}>Thách thức & khó khăn</h3>
            <p className={styles.sectionContent}>{report.challenges}</p>
          </div>
        )}

        {report.nextSteps && (
          <div className={styles.reportSection}>
            <h3 className={styles.sectionTitle}>Kế hoạch tiếp theo</h3>
            <p className={styles.sectionContent}>{report.nextSteps}</p>
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
              {report.reportTasks.map((task) => (
                <tr key={task.taskId}>
                  <td>
                    <div>{task.title}</div>
                    <div className={styles.taskNotes}>{task.notes}</div>
                  </td>
                  <td>
                    {task.status === TaskStatus.TODO && (
                      <span className={styles.taskStatusTodo}>Todo</span>
                    )}
                    {task.status === TaskStatus.IN_PROGRESS && (
                      <span className={styles.taskStatusInProgress}>
                        In Progress
                      </span>
                    )}
                    {task.status === TaskStatus.DONE && (
                      <span className={styles.taskStatusDone}>Done</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                      <span className={styles.progressText}>
                        {task.progress}%
                      </span>
                    </div>
                  </td>
                  <td>{task.timeSpent}h</td>
                </tr>
              ))}
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
    </>
  );
};

export default ReportDetail;
