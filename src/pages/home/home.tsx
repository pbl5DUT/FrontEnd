import { MainLayout } from "@/layouts/Mainlayout";
import pageStyles from '@/styles/mainPage.module.css';

export default function HomePage() {
  return (
    <MainLayout title="Trang chủ">
      <div className={pageStyles.pageContainer}>
        <div className={pageStyles.pageHeader}>
          <h1 className={pageStyles.pageTitle}>Quản lý dự án</h1>
        </div>
        <div style={{ padding: '2rem' }}>
          <h1>🏠 Home</h1>   
        </div>
      </div>
    </MainLayout>
  );
}
