// modules/stacks/Reports.tsx
import React, { useEffect, useState } from 'react';
import ReportsList from './components/reports_list';
import ReportDetail from './components/report_detail';
import CreateReportForm from './components/create_report_form';
import { WorkReport } from './types/report';
import styles from './styles/Reports.module.css';
import { getCurrentUser, User } from '../auth/services/authService';

// Trong ứng dụng thực tế, thông tin này sẽ được lấy từ context auth


const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<WorkReport | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [refreshReports, setRefreshReports] = useState(0);
  const [user, setUser] = useState<User | null>(null); // Khởi tạo giá trị mặc định là null

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    const userId = String(currentUser?.user_id || '');
    // Có thể sử dụng userId tại đây nếu cần
  }, []);

  const handleSelectReport = (report: WorkReport) => {
    console.log('Selected report:', report); // Debug log
    setSelectedReport(report);
  };

  const handleCreateReport = () => {
    console.log('Opening create form'); // Debug log
    setIsCreating(true);
  };

  const handleCloseDetail = () => {
    setSelectedReport(null);
  };

  const handleCloseCreateForm = () => {
    console.log('Closing create form'); // Debug log
    setIsCreating(false);
  };

  const handleReportUpdated = () => {
    setRefreshReports((prev) => prev + 1);
    setSelectedReport(null); // Close modal after update
  };

  const handleReportCreated = () => {
    console.log('Report created successfully'); // Debug log
    setRefreshReports((prev) => prev + 1); // Refresh the reports list
    setIsCreating(false); // Close the create form
  };

  return (
    <div className={styles.reportsWrapper}>
      <ReportsList
        userId={user?.user_id || ''}
        onSelectReport={handleSelectReport}
        onCreateReport={handleCreateReport}
        // refreshTrigger={refreshReports}
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
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'modalEnter 0.2s ease-out',
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

      {/* Modal for Create Report Form */}
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
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'modalEnter 0.2s ease-out',
            }}
          >
            <CreateReportForm
              userId={user?.user_id || ''}
              userName={user?.user_id || ''}
              onClose={handleCloseCreateForm}
              onReportCreated={handleReportCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;