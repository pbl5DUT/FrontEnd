import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './topbar.module.css';
import { useAuth } from '@/modules/auth/contexts/auth_context';
import { getCurrentUser } from '@/modules/auth/services/authService';

export const Topbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('/assets/user.png'); // Default avatar
  const { logout } = useAuth(); // Sử dụng hook useAuth để lấy hàm logout

  // Lấy thông tin người dùng khi component được mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserName(user.full_name);
      // Nếu user có avatar thì sử dụng, nếu không thì dùng ảnh mặc định
      if (user.avatar) {
        setUserAvatar(user.avatar);
      }
    }
  }, []);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    // Gọi hàm logout từ context
    logout();
    // Đóng dropdown sau khi đăng xuất
    setIsDropdownOpen(false);
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div className={styles.rightSection}>
            <img src="/assets/flag.png" alt="Flag" className={styles.icon} />
            <img
              src="/assets/notification.png"
              alt="Notification"
              className={styles.icon}
            />
            <div className={styles.userInfo}>
              <img
                src={userAvatar}
                alt="User Avatar"
                className={styles.avatar}
              />
              <span
                className={styles.userName}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {userName}
              </span>
              {isDropdownOpen && (
                <div className={styles.dropdown}>
                  <Link href="/profile" className={styles.dropdownItem}>
                    Hồ sơ cá nhân
                  </Link>
                  <Link href="/settings" className={styles.dropdownItem}>
                    Cài đặt
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      </div>
    </header>
  );
};
