
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import styles from './topbar.module.css';

export const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const handleLogout = () => {
        console.log('User logged out');
        localStorage.removeItem('token');
        window.location.href = '/view/pages/Login';
      };
    return (
        <header className={styles.topbar}>
        <div className={styles.container}> {/* Apply CSS Module class */}
        <header className={styles.topBar}>
          <div className={styles.rightSection}>
            <img src="/assets/flag.png" alt="Flag" className={styles.icon} />
            <img src="/assets/notification.png" alt="Notification" className={styles.icon} />
            <div className={styles.userInfo}>
              <img src="/assets/user.png" alt="User Avatar" className={styles.avatar} />
              <span
                className={styles.userName}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                Nguyen Van A
              </span>
              {isDropdownOpen && (
                <div className={styles.dropdown}>
                  <button onClick={handleLogout} className={styles.logoutButton}>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        </div>
        </header>
   )
}