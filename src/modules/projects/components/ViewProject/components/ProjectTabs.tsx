import React from 'react';
import styles from '../ViewProjectPage.module.css';

type TabType = 'overview' | 'tasks' | 'members' | 'files' | 'comments';

interface ProjectTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tabButton} ${
          activeTab === 'overview' ? styles.active : ''
        }`}
        onClick={() => setActiveTab('overview')}
      >
        Tổng quan
      </button>
      <button
        className={`${styles.tabButton} ${
          activeTab === 'tasks' ? styles.active : ''
        }`}
        onClick={() => setActiveTab('tasks')}
      >
        Công việc
      </button>
      <button
        className={`${styles.tabButton} ${
          activeTab === 'members' ? styles.active : ''
        }`}
        onClick={() => setActiveTab('members')}
      >
        Thành viên
      </button>
      <button
        className={`${styles.tabButton} ${
          activeTab === 'files' ? styles.active : ''
        }`}
        onClick={() => setActiveTab('files')}
      >
        Tệp đính kèm
      </button>
      <button
        className={`${styles.tabButton} ${
          activeTab === 'comments' ? styles.active : ''
        }`}
        onClick={() => setActiveTab('comments')}
      >
        Bình luận
      </button>
    </div>
  );
};