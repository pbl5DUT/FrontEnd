import React from 'react';
import ProjectList from '@/modules/projects/components/ProjectList/ProjectList';
import { MainLayout } from '@/layouts/Mainlayout';
import pageStyles from '@/styles/mainPage.module.css';

export default function ViewProjectsPage() {
  // return <ProjectList />;
  return (
   <MainLayout>
      <div className={pageStyles.pageContainer}>
        <div className={pageStyles.pageHeader}>
          <h1 className={pageStyles.pageTitle}>Quản lý dự án</h1>
        </div>
        <ProjectList />
      </div>
   </MainLayout>
  );
}


