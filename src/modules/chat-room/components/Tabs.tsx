import React from 'react';
import styles from './Tabs.module.css';

interface TabsProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className={styles.tabsContainer}>
      <button
        className={`${styles.tabButton} ${
          activeTab === 'recent' ? styles.activeTab : ''
        }`}
        onClick={() => setActiveTab('recent')}
      >
        Mới nhất
      </button>      <button
        className={`${styles.tabButton} ${
          activeTab === 'users' ? styles.activeTab : ''
        }`}
        onClick={() => setActiveTab('users')}
      >
        Tất cả người dùng
      </button>
      <button
        className={`${styles.tabButton} ${
          activeTab === 'groups' ? styles.activeTab : ''
        }`}
        onClick={() => setActiveTab('groups')}
      >
        Nhóm
      </button>
    </div>
  );
};

export default Tabs;
