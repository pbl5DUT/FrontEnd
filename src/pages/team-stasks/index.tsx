// app/manage/tasks/page.tsx
'use client';

import { MainLayout } from '@/layouts/Mainlayout';
import pageStyles from '@/styles/mainPage.module.css';
import TeamTasks from '@/modules/stacks/index';

export default function TeamTasksPage() {
  return (
    <MainLayout>
      <div className={pageStyles.pageContainer}>
        <div className={pageStyles.pageHeader}>
          <h1 className={pageStyles.pageTitle}>Quản lý tasks nhóm</h1>
        </div>
        <TeamTasks />
      </div>
    </MainLayout>
  );
}
