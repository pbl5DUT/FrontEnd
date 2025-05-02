'use client';

import { MainLayout } from '@/layouts/Mainlayout';
import pageStyles from '@/styles/mainPage.module.css';
import DocumentationPage from '@/modules/documentation/index';

export default function ProjectDocumentation() {
  return (
    <MainLayout title="Tài liệu dự án">
      <div className={pageStyles.pageContainer}>
        <div className={pageStyles.pageHeader}>
          <h1 className={pageStyles.pageTitle}>Tài liệu dự án</h1>
        </div>
        <DocumentationPage />
      </div>
    </MainLayout>
  );
}
