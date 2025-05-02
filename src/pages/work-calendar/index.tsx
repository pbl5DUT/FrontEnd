'use client';

import { MainLayout } from '@/layouts/Mainlayout';
import pageStyles from '@/styles/mainPage.module.css';
import WorkCalendar from '@/modules/work_calendar/components/work_calendar';
import CalendarPage from '@/modules/work_calendar/index';

export default function WorkCalendarPage() {
  return (
    <MainLayout title="Lịch làm việc">
      <div className={pageStyles.pageContainer}>
        <div className={pageStyles.pageHeader}>
          <h1 className={pageStyles.pageTitle}>Lịch làm việc</h1>
        </div>
        {/* <WorkCalendar /> */}
        <CalendarPage />
      </div>
    </MainLayout>
  );
}
