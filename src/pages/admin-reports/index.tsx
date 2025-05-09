import { MainLayout } from '@/layouts/Mainlayout';
import pageStyles from '@/styles/mainPage.module.css';
import AdminReportsProps from '@/modules/admin-reports/components/AdminReports';
export default function ChatRoomPage() {
  return (
    <MainLayout title="Báo cáo công việc">
      <div className={pageStyles.pageContainer}>
        <div className={pageStyles.pageHeader}>
          <h1 className={pageStyles.pageTitle}></h1>
        </div>
        <AdminReportsProps />
      </div>
    </MainLayout>
  );
}
