import { MainLayout } from '@/layouts/Mainlayout';
import ViewProjectPage from '@/modules/projects/components/ViewProject/ViewProjectPage';
import pageStyles from '@/styles/mainPage.module.css';

export default function ProjectDetailsPage() {
  // Trong Pages Router, không cần truyền params vào component
  // ViewProjectPage sẽ tự lấy params từ router.query
  return <ViewProjectPage />;
  // return (
  //   <MainLayout>
  //     <div className={pageStyles.pageContainer}>
  //       <div className={pageStyles.pageHeader}>
  //         <h1 className={pageStyles.pageTitle}>Quản lý dự án</h1>
  //       </div>
  //       <ViewProjectPage />;
  //     </div>
  //   </MainLayout>
  // );
}
