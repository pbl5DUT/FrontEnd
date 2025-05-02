'use client';

import React from 'react';
import WorkCalendar from './components/work_calendar';
import CalendarSidebar from './components/calendar_sidebar';
import UpcomingEvents from './components/upcoming_events';
import styles from './styles/work_calendar.module.css';

const CalendarPage: React.FC = () => {
  return (
    <div className={styles.calendarPage}>
      <div className={styles.calendarLayout}>
        <div className={styles.mainCalendar}>
          <WorkCalendar />
        </div>
        <div className={styles.calendarSidebar}>
          <CalendarSidebar />
          <UpcomingEvents />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
