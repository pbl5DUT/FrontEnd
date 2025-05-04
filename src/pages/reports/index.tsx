// app/reports/page.tsx
'use client';

import { MainLayout } from '@/layouts/Mainlayout';
import pageStyles from '@/styles/mainPage.module.css';
import Reports from '@/modules/reports/index';

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className={pageStyles.pageContainer}>
        <div className={pageStyles.pageHeader}>
          <h1 className={pageStyles.pageTitle}>Báo cáo công việc</h1>
        </div>
        <Reports />
      </div>
    </MainLayout>
  );
}
