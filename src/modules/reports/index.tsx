// modules/stacks/Reports.tsx
import React, { useState } from 'react';
import ReportsList from './components/reports_list';
import ReportDetail from './components/report_detail';
// import CreateReportForm from './components/create_report_form';
import { WorkReport } from './types/report';
import styles from './styles/Reports.module.css';

// Trong ứng dụng thực tế, thông tin này sẽ được lấy từ context auth
const CURRENT_USER = {
  id: 'user-2',
  name: 'Nguyễn Văn A',
};

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<WorkReport | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [refreshReports, setRefreshReports] = useState(0);

  const handleSelectReport = (report: WorkReport) => {
    setSelectedReport(report);
  };

  const handleCreateReport = () => {
    setIsCreating(true);
  };

  const handleCloseDetail = () => {
    setSelectedReport(null);
  };

  const handleCloseCreateForm = () => {
    setIsCreating(false);
  };

  const handleReportUpdated = () => {
    setRefreshReports((prev) => prev + 1);
  };

  return (
    <div className={styles.reportsWrapper}>
      <ReportsList
        userId={CURRENT_USER.id}
        onSelectReport={handleSelectReport}
        onCreateReport={handleCreateReport}
        key={`reports-list-${refreshReports}`}
      />

      {selectedReport && (
        <div className={styles.modalOverlay} onClick={handleCloseDetail}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <ReportDetail
              report={selectedReport}
              onClose={handleCloseDetail}
              onReportUpdated={handleReportUpdated}
            />
          </div>
        </div>
      )}

      {/* {isCreating && (
        <div className={styles.modalOverlay} onClick={handleCloseCreateForm}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <CreateReportForm
              userId={CURRENT_USER.id}
              userName={CURRENT_USER.name}
              onClose={handleCloseCreateForm}
              onReportCreated={handleReportUpdated}
            />
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Reports;
