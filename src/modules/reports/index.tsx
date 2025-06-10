// modules/stacks/Reports.tsx
import React, { useState } from 'react';
import ReportsList from './components/reports_list';
import ReportDetail from './components/report_detail';
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
    console.log('Selected report:', report); // Debug log
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
    setSelectedReport(null); // Close modal after update
  };

  return (
    <div className={styles.reportsWrapper}>
      <ReportsList
        userId={CURRENT_USER.id}
        onSelectReport={handleSelectReport}
        onCreateReport={handleCreateReport}
        key={`reports-list-${refreshReports}`}
      />

      {/* Modal for Report Detail */}
      {selectedReport && (
        <div 
          className={styles.modalOverlay} 
          onClick={handleCloseDetail}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
            }}
          >
            <ReportDetail
              report={selectedReport}
              onClose={handleCloseDetail}
              onReportUpdated={handleReportUpdated}
            />
          </div>
        </div>
      )}

      {/* Modal for Create Report Form - if needed later */}
      {isCreating && (
        <div 
          className={styles.modalOverlay} 
          onClick={handleCloseCreateForm}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
            }}
          >
            <div>
              <h2>Tạo báo cáo mới</h2>
              <p>Form tạo báo cáo sẽ được implement sau...</p>
              <button onClick={handleCloseCreateForm}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;