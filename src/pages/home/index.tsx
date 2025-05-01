'use client';

import { MainLayout } from '@/layouts/Mainlayout';
import pageStyles from '@/styles/mainPage.module.css';
import ProjectOverview from '@/modules/home/components/project_overview';
export default function HomePage() {
  return (
    <MainLayout title="Trang chủ">
      <div className={pageStyles.pageContainer}>
        <div className={pageStyles.pageHeader}>
          <h1 className={pageStyles.pageTitle}></h1>
        </div>
        <ProjectOverview />
      </div>
    </MainLayout>
  );
}
