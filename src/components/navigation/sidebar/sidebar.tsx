// components/Sidebar.jsx

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './sidebar.module.css';

const navItems = [
  { href: '/home', label: 'Bảng tổng kết' },
  { href: '/projects', label: 'Quản lý dự án' },
  { href: '/employee', label: 'Quản lý nhân viên' },
  { href: '/view/pages/chatroomPage', label: 'Phòng trò chuyện' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <Link href="/home" className={styles.logo}>
        <img src="/assets/logo.png" alt="Logo" />
      </Link>

      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={pathname === item.href ? `${styles.link} ${styles.active}` : styles.link}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
