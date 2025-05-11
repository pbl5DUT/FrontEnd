'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/contexts/auth_context';
import { UserRole } from '@/modules/auth/services/authService';
import styles from './sidebar.module.css';

interface MenuItem {
  href: string;
  label: string;
  icon: string;
  roles: UserRole[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}
const sections: MenuSection[] = [
  {
    title: 'QUẢN TRỊ',
    items: [
      {
        href: '/admin/dashboard',
        label: 'Dashboard Admin',
        icon: '/assets/icons/admin-dashboard.svg',
        roles: [UserRole.ADMIN],
      },
      {
        href: '/admin-reports',
        label: 'Báo cáo nhân viên',
        icon: '/assets/icons/admin-reports.svg',
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    title: 'ỨNG DỤNG',
    items: [
      {
        href: '/home',
        label: 'Bảng tổng kết',
        icon: '/assets/icons/house-solid.svg',
        roles: [UserRole.MANAGE, UserRole.USER],
      },
      {
        href: '/projects',
        label: 'Quản lý dự án',
        icon: '/assets/icons/project.png',
        roles: [UserRole.ADMIN, UserRole.MANAGE, UserRole.USER],
      },
      {
        href: '/employee',
        label: 'Quản lý nhân viên',
        icon: '/assets/icons/employee.png',
        roles: [UserRole.ADMIN, UserRole.MANAGE],
      },
      {
        href: '/team-stasks',
        label: 'Quản lý tasks nhóm',
        icon: '/assets/icons/team-tasks.png',
        roles: [UserRole.MANAGE],
      },
      {
        href: '/tasks',
        label: 'Công việc của tôi',
        icon: '/assets/icons/tasks.png',
        roles: [UserRole.MANAGE, UserRole.USER],
      },
      {
        href: '/reports',
        label: 'Báo cáo công việc',
        icon: '/assets/icons/report.png',
        roles: [UserRole.MANAGE, UserRole.USER],
      },
    ],
  },

  {
    title: 'TIỆN ÍCH',
    items: [
      {
        href: '/chat-room',
        label: 'Phòng trò chuyện',
        icon: '/assets/icons/speech-bubble.png',
        roles: [UserRole.ADMIN, UserRole.MANAGE, UserRole.USER],
      },
      {
        href: '/work-calendar',
        label: 'Lịch làm việc',
        icon: '/assets/icons/calendar.png',
        roles: [UserRole.ADMIN, UserRole.MANAGE, UserRole.USER],
      },
      {
        href: '/documentation',
        label: 'Tài liệu dự án',
        icon: '/assets/icons/documentation.png',
        roles: [UserRole.ADMIN, UserRole.MANAGE, UserRole.USER],
      },
      {
        href: '/knowledge-base',
        label: 'Cơ sở kiến thức',
        icon: '/assets/icons/knowledge.png',
        roles: [UserRole.ADMIN, UserRole.MANAGE, UserRole.USER],
      },
    ],
  },
];
export const Sidebar = () => {
  const pathname = usePathname();
  const { user, checkPermission, isLoading } = useAuth();

  // Không render khi chưa sẵn sàng
  if (isLoading || !user) return null;

  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => checkPermission(item.roles)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className={styles.sidebar}>
      <Link href="/home" className={styles.logo}>
        <img src="/assets/logo.png" alt="Logo" />
      </Link>

      <div className={styles.userRole}>
      <span className={styles.roleTag}>{user.role}</span>
      </div>


      <nav>
        {filteredSections.map((section) => (
          <div key={section.title} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <ul className={styles.navList}>
              {section.items.map((item) => (
                <li
                  key={item.href}
                  className={`${styles.navItem} ${
                    pathname === item.href ? styles.active : ''
                  }`}
                >
                  <Link href={item.href} className={styles.navLink}>
                    <img src={item.icon} alt="" className={styles.icon} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};
