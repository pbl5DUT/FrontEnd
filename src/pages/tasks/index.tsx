// app/tasks/page.tsx
'use client';

import { MainLayout } from '@/layouts/Mainlayout';
import pageStyles from '@/styles/mainPage.module.css';
import TasksPage from '@/modules/stacks/index';

export default function MyTasksPage() {
  return (
    <MainLayout title="Công việc của tôi">
      <div className={pageStyles.pageContainer}>
        <div className={pageStyles.pageHeader}>
          <h1 className={pageStyles.pageTitle}>Công việc của tôi</h1>
        </div>
        <TasksPage />
      </div>
    </MainLayout>
  );
}
