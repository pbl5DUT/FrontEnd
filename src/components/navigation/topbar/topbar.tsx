'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './topbar.module.css';
import { useAuth } from '@/modules/auth/contexts/auth_context';
import { getCurrentUser } from '@/modules/auth/services/authService';

interface Notification {
  id: string;
  message: string;
  time: Date;
}

export const Topbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('/assets/user.png');
  const { logout } = useAuth();

  // Lấy thông tin người dùng
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserName(user.full_name);
      if (user.avatar) setUserAvatar(user.avatar);
    }
  }, []);

  // Gọi API sự kiện và đặt lịch thông báo
  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://127.0.0.1:8000/api/calendar/events', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);
        const data = await res.json();

        timers = data.map((event: any) => {
          const eventTime = new Date(event.start).getTime();
          const notifyTime = eventTime - 60 * 1000;
          const now = Date.now();

          if (notifyTime > now) {
            return setTimeout(() => {
              setNotifications((prev) => [
                ...prev,
                {
                  id: event.event_id,
                  message: `Sự kiện "${event.title}" sẽ diễn ra sau 1 phút.`,
                  time: new Date(),
                },
              ]);
            }, notifyTime - now);
          }
          return null;
        });
      } catch (err) {
        console.error('Lỗi khi lấy sự kiện:', err);
      }
    };

    fetchEvents();

    return () => timers.forEach((t) => t && clearTimeout(t));
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.rightSection}>
            <img src="/assets/flag.png" alt="Flag" className={styles.icon} />

            {/* Thông báo */}
            <div className={styles.notificationWrapper}>
              <img
                src="/assets/notification.png"
                alt="Notification"
                className={styles.icon}
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              />
              {notifications.length > 0 && <span className={styles.dot}></span>}

              {showNotificationDropdown && (
                <div className={styles.notificationDropdown}>
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className={styles.notificationItem}>
                        {n.message}
                      </div>
                    ))
                  ) : (
                    <div className={styles.empty}>Không có thông báo</div>
                  )}
                </div>
              )}
            </div>

            {/* Người dùng */}
            <div className={styles.userInfo}>
              <img src={userAvatar} alt="User" className={styles.avatar} />
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
                  <button onClick={handleLogout} className={styles.logoutButton}>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
