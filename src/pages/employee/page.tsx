'use client';

import { MainLayout } from '@/layouts/Mainlayout';
import { EmployeeList } from '@/modules/employee/components/EmployeeList/EmployeeList';
import pageStyles from '@/styles/mainPage.module.css';

export default function ViewEmployeePage() {
  return (
    <MainLayout title="Quản lý nhân viên">
      <div className={pageStyles.pageContainer}>
        <div className={pageStyles.pageHeader}>
        </div>
        <EmployeeList />
      </div>
    </MainLayout>
  );
} 